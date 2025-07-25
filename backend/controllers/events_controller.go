// controllers/events.go
package controllers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
	"tivramedi/database"
	"tivramedi/models"
)

type Broker struct {
	clients map[chan string]bool
	mutex   sync.Mutex
}

var BookingBroker = &Broker{
	clients: make(map[chan string]bool),
}

// Go routine 1: Handle client connections
func (b *Broker) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	// ADD: CORS headers for browser compatibility
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Cache-Control")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")

	messageChan := make(chan string)
	b.mutex.Lock()
	b.clients[messageChan] = true
	b.mutex.Unlock()

	defer func() {
		b.mutex.Lock()
		delete(b.clients, messageChan)
		b.mutex.Unlock()
		close(messageChan)
	}()

	// Send initial "connected" event
	connectionMsg := map[string]interface{}{
		"type":      "connected",
		"message":   "SSE connection established",
		"timestamp": time.Now().Unix(),
	}
	connectionData, _ := json.Marshal(connectionMsg)
	fmt.Fprintf(w, "data: %s\n\n", string(connectionData))
	flusher.Flush()

	for {
		select {
		case msg := <-messageChan:
			fmt.Fprintf(w, "data: %s\n\n", msg)
			flusher.Flush()
		case <-r.Context().Done():
			return
		}
	}
}

// Go routine 2: Broadcast messages to all clients
// func (b *Broker) Broadcast(message string) {
// 	b.mutex.Lock()
// 	defer b.mutex.Unlock()

// 	for client := range b.clients {
// 		select {
// 		case client <- message:
// 		case <-time.After(5 * time.Second):
// 			delete(b.clients, client)
// 			close(client)
// 		}
// 	}
// }

// 🔹 Broadcast doctor availability updates
func (b *Broker) BroadcastAvailability(doctorID int, available bool) {
	b.mutex.Lock()
	defer b.mutex.Unlock()

	data := map[string]interface{}{
		"type":      "availability",
		"doctorID":  doctorID,
		"available": available,
	}

	jsonData, _ := json.Marshal(data)

	for client := range b.clients {
		select {
		case client <- string(jsonData):
		case <-time.After(5 * time.Second):
			delete(b.clients, client)
			close(client)
		}
	}
}

// 🔹 Update doctor availability in DB and notify clients
func (b *Broker) UpdateDoctorAvailability(doctorID int, available bool) error {

	fmt.Printf("🔄 Updating Doctor %d availability to: %v\n", doctorID, available)

	// Update the doctor's availability in the database
	result := database.DB.Model(&models.Doctor{}).Where("id = ?", doctorID).Update("availability", available)
	if result.Error != nil {
		log.Printf("❌ Error updating doctor availability: %v\n", result.Error)
		return result.Error
	}

	if result.RowsAffected == 0 {
		log.Printf("⚠️ No doctor found with ID %d\n", doctorID)
		return fmt.Errorf("doctor with ID %d not found", doctorID)
	}

	// Broadcast the update to all SSE clients
	fmt.Printf("📡 Broadcasting availability update to %d clients\n", len(b.clients))
	b.BroadcastAvailability(doctorID, available)
	fmt.Printf("✅ Doctor %d availability updated successfully: %v\n", doctorID, available)

	return nil
}

func (b *Broker) StartHeartbeat() {
	ticker := time.NewTicker(30 * time.Second)
	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				heartbeat := map[string]interface{}{
					"type":      "heartbeat",
					"timestamp": time.Now().Unix(),
				}
				heartbeatData, _ := json.Marshal(heartbeat)

				b.mutex.Lock()
				clientCount := len(b.clients)
				for client := range b.clients {
					select {
					case client <- string(heartbeatData):
					default:
						// Client channel is full, remove it
						delete(b.clients, client)
						close(client)
					}
				}
				b.mutex.Unlock()

				if clientCount > 0 {
					fmt.Printf("💓 Heartbeat sent to %d SSE clients\n", clientCount)
				}
			}
		}
	}()
}
