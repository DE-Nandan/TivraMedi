// controllers/events.go
package controllers

import (
	"fmt"
	"net/http"
	"sync"
	"time"
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
func (b *Broker) Broadcast(message string) {
	b.mutex.Lock()
	defer b.mutex.Unlock()

	for client := range b.clients {
		select {
		case client <- message:
		case <-time.After(5 * time.Second):
			delete(b.clients, client)
			close(client)
		}
	}
}
