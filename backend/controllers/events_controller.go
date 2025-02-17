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

	// 🔹 Update the doctor's availability in the database
	result := database.DB.Model(&models.Doctor{}).Where("id = ?", doctorID).Update("availability", available)
	if result.Error != nil {
		log.Printf("Error updating doctor availability: %v\n", result.Error)
		return result.Error
	}

	// 🔹 Broadcast the update to all SSE clients
	BookingBroker.BroadcastAvailability(doctorID, available)
	fmt.Printf("Doctor %d availability updated: %v\n", doctorID, available)

	return nil
}
