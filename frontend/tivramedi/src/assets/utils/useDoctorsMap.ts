// src/assets/utils/useDoctorsMap.ts
import { ref, type Ref } from 'vue'
import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchDoctors, fetchDoctorDetails, bookAppointment } from '@/services/mapService'

// Type definitions
export interface Doctor {
  ID: number
  Name: string
  Specialty: string
  Latitude: number
  Longitude: number
  Availability: boolean
}

export interface Position {
  coords: {
    latitude: number
    longitude: number
  }
}

export interface BookingResult {
  message: string
  success?: boolean
}

export interface DoctorUpdateData {
  doctorID: number
  available: boolean
}

// Default Leaflet marker icon setup
const defaultIcon: L.Icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const greenIcon: L.Icon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function useDoctorsMap() {
  // Reactive refs with proper typing
  const doctors: Ref<Doctor[]> = ref([])
  const loading: Ref<boolean> = ref(true)
  const error: Ref<string | null> = ref(null)

  // Store the map instance
  let map: L.Map | null = null

  // Store markers with proper typing
  const markers: Record<number, L.Marker> = {}

  // Keep localhost for local development
  const eventsEndpoint: string =
    import.meta.env.VITE_EVENTS_ENDPOINT || 'http://localhost:8080/events'

  const initializeMap = async (containerId: string): Promise<void> => {
    try {
      // Ensure the DOM is ready
      const mapContainer: HTMLElement | null = document.getElementById(containerId)
      if (!mapContainer) {
        throw new Error('Map container not found')
      }

      // Get user's current location
      const position: Position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos: GeolocationPosition) => resolve(pos as Position),
          (err: GeolocationPositionError) => reject(err),
        )
      })

      // Prevent duplicate maps
      if (!map) {
        map = L.map(containerId).setView([position.coords.latitude, position.coords.longitude], 13)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)
      }

      // Add user's location marker
      L.marker([position.coords.latitude, position.coords.longitude], {
        icon: defaultIcon,
      })
        .bindPopup('Your Location')
        .addTo(map)

      // Fetch doctors from the backend
      doctors.value = await fetchDoctors()
      doctors.value = doctors.value.filter((doctor: Doctor) => doctor.Availability)

      doctors.value.forEach((doctor: Doctor) => addDoctorMarker(doctor))

      // Listening to SSE Events
      listenForDoctorUpdates()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      error.value = 'Error loading map: ' + errorMessage
    } finally {
      loading.value = false
    }
  }

  // Function to add a doctor marker
  const addDoctorMarker = (doctor: Doctor): void => {
    if (markers[doctor.ID]) return // Prevent duplicate markers

    const marker: L.Marker = L.marker([doctor.Latitude, doctor.Longitude], {
      icon: greenIcon,
    })

    const popupContent: string = `
      <div class="doctor-popup">
        <h3>${doctor.Name}</h3>
        <p><strong>Specialty:</strong> ${doctor.Specialty}</p>
        <p><strong>Status:</strong> <span id="doctor-${doctor.ID}-status">${doctor.Availability ? '✅ Available' : '❌ Unavailable'}</span></p>
        <button class="book-btn" onclick="bookAppointment(${doctor.ID})">Book</button>
      </div>
    `

    marker.bindPopup(popupContent).addTo(map!)
    markers[doctor.ID] = marker // Store marker

    // Bind the bookAppointment function to the button inside the popup
    marker.on('popupopen', () => {
      const popup = marker.getPopup()
      if (popup) {
        const popupElement = popup.getElement()
        if (popupElement) {
          const bookButton = popupElement.querySelector('.book-btn') as HTMLButtonElement
          if (bookButton) {
            bookButton.onclick = () => handleBookAppointment(doctor.ID)
          }
        }
      }
    })
  }

  // Function to remove a doctor marker
  const removeDoctorMarker = (doctorID: number): void => {
    if (markers[doctorID]) {
      markers[doctorID].remove() // Remove from map
      delete markers[doctorID] // Remove from stored markers
    }
  }

  // Listen for SSE updates
  const listenForDoctorUpdates = (): void => {
    const eventSource: EventSource = new EventSource(eventsEndpoint)

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const data: DoctorUpdateData = JSON.parse(event.data)
        console.log('Real-time update:', data)
        alert(`Live update: ${event.data}`)

        // Update UI
        const statusElement: HTMLElement | null = document.getElementById(
          `doctor-${data.doctorID}-status`,
        )
        if (statusElement) {
          statusElement.textContent = data.available ? '✅ Available' : '❌ Unavailable'
        }

        // Remove or add marker based on availability
        if (!data.available) {
          removeDoctorMarker(data.doctorID)
        } else {
          // Fetch doctor details and add the marker
          fetchDoctorDetails(data.doctorID)
            .then((doctor: Doctor) => addDoctorMarker(doctor))
            .catch((err: Error) => console.error('Error fetching doctor data:', err))
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err)
      }
    }

    eventSource.onerror = (event: Event) => {
      console.error('SSE connection error:', event)
    }
  }

  const handleBookAppointment = async (doctorId: number): Promise<void> => {
    const timeSlot: string = '2023-08-15 10:00' // Replace with actual time slot selection
    try {
      const result: BookingResult = await bookAppointment(doctorId, timeSlot)
      alert(result.message)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      alert('Booking failed: ' + errorMessage)
    }
  }

  return {
    doctors,
    loading,
    error,
    initializeMap,
  }
}
