// src/assets/utils/useDoctorsMap.ts
import { ref, type Ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Type definitions - Updated to match your API response
export interface Doctor {
  id: number           // lowercase to match API
  name: string         // lowercase to match API
  specialty: string    // lowercase to match API
  latitude: number     // lowercase to match API
  longitude: number    // lowercase to match API
  availability: boolean // lowercase to match API
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
  id?: number
}

// Updated to match your SSE data structure
export interface SSEEventData {
  type: string
  doctorID: number
  available: boolean
  timestamp: number
  message?: string
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
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const redIcon: L.Icon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
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

  // SSE connection
  let eventSource: EventSource | null = null

  // Environment-aware endpoint configuration
  const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development'

  const getApiEndpoint = (path: string): string => {
    if (isDev) {
      // Local development - direct backend endpoints
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
      return `${baseUrl}${path}`
    } else {
      // Production/Docker - use nginx proxy
      return path
    }
  }

  // Environment-aware endpoints
  const eventsEndpoint = isDev
    ? (import.meta.env.VITE_EVENTS_ENDPOINT || 'http://localhost:8080/events')
    : '/api/events'

  console.log('🌍 Environment:', isDev ? 'Development' : 'Production')
  console.log('📡 SSE Endpoint:', eventsEndpoint)

  // Fetch doctors from API with environment awareness
  const fetchDoctors = async (): Promise<Doctor[]> => {
    try {
      console.log('🔄 Fetching doctors from API...')

      const endpoint = isDev
        ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/doctors'
        : '/api/doctors'

      console.log('📍 Using doctors endpoint:', endpoint)

      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Doctors data received:', data)
      console.log('📊 Number of doctors:', data.length)

      return data
    } catch (err) {
      console.error('❌ Error fetching doctors:', err)
      throw err
    }
  }

  // Fetch single doctor details
  const fetchDoctorDetails = async (doctorId: number): Promise<Doctor> => {
    const endpoint = isDev
      ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + `/doctors/${doctorId}`
      : `/api/doctors/${doctorId}`

    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`Failed to fetch doctor ${doctorId}`)
    }
    return response.json()
  }

  // Book appointment with environment awareness
  const bookAppointment = async (doctorId: number, timeSlot: string): Promise<BookingResult> => {
    try {
      const endpoint = isDev
        ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/book'
        : '/api/book'

      console.log('📅 Booking endpoint:', endpoint)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          time_slot: timeSlot,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      console.error('❌ Booking error:', err)
      throw err
    }
  }

  const initializeMap = async (containerId: string): Promise<void> => {
    try {
      console.log('🗺️ Initializing map...')

      // Ensure the DOM is ready
      const mapContainer: HTMLElement | null = document.getElementById(containerId)
      if (!mapContainer) {
        throw new Error(`Map container '${containerId}' not found`)
      }

      // Get user's current location with fallback
      let userPosition = { latitude: 40.7128, longitude: -74.0060 } // NYC fallback

      try {
        const position: Position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos: GeolocationPosition) => resolve(pos as Position),
            (err: GeolocationPositionError) => reject(err),
            { timeout: 10000 }
          )
        })
        userPosition = position.coords
        console.log('📍 User location obtained:', userPosition)
      } catch (geoError) {
        console.warn('⚠️ Geolocation failed, using fallback location:', geoError)
      }

      // Prevent duplicate maps
      if (!map) {
        map = L.map(containerId).setView([userPosition.latitude, userPosition.longitude], 13)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        console.log('✅ Map initialized')
      }

      // Add user's location marker
      L.marker([userPosition.latitude, userPosition.longitude], {
        icon: defaultIcon,
      })
        .bindPopup('📍 Your Location')
        .addTo(map)

      // Fetch doctors from the backend
      console.log('🏥 Loading doctors...')
      doctors.value = await fetchDoctors()

      // Filter and add only available doctors
      const availableDoctors = doctors.value.filter((doctor: Doctor) => doctor.availability)
      console.log(`📊 Showing ${availableDoctors.length} available doctors out of ${doctors.value.length} total`)

      availableDoctors.forEach((doctor: Doctor) => {
        console.log(`📍 Adding marker for Dr. ${doctor.name}`)
        addDoctorMarker(doctor)
      })

      // Start listening to SSE Events
      listenForDoctorUpdates()

      console.log('🎉 Map initialization complete')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('❌ Map initialization failed:', errorMessage)
      error.value = 'Error loading map: ' + errorMessage
    } finally {
      loading.value = false
    }
  }

  // Function to add a doctor marker
  const addDoctorMarker = (doctor: Doctor): void => {
    if (markers[doctor.id]) {
      console.log(`⚠️ Marker for doctor ${doctor.id} already exists`)
      return // Prevent duplicate markers
    }

    console.log(`📍 Creating marker for Dr. ${doctor.name} at [${doctor.latitude}, ${doctor.longitude}]`)

    const marker: L.Marker = L.marker([doctor.latitude, doctor.longitude], {
      icon: doctor.availability ? greenIcon : redIcon,
    })

    const popupContent: string = `
      <div class="doctor-popup">
        <h3>🩺 ${doctor.name}</h3>
        <p><strong>Specialty:</strong> ${doctor.specialty}</p>
        <p><strong>Status:</strong> <span id="doctor-${doctor.id}-status">${doctor.availability ? '✅ Available' : '❌ Unavailable'}</span></p>
        ${doctor.availability ? '<button class="book-btn" data-doctor-id="' + doctor.id + '">📅 Book Appointment</button>' : ''}
      </div>
    `

    marker.bindPopup(popupContent).addTo(map!)
    markers[doctor.id] = marker // Store marker

    // Bind the bookAppointment function to the button inside the popup
    marker.on('popupopen', () => {
      const popup = marker.getPopup()
      if (popup) {
        const popupElement = popup.getElement()
        if (popupElement) {
          const bookButton = popupElement.querySelector('.book-btn') as HTMLButtonElement
          if (bookButton) {
            bookButton.onclick = () => handleBookAppointment(doctor.id)
          }
        }
      }
    })

    console.log(`✅ Marker added for Dr. ${doctor.name}`)
  }

  // Function to remove a doctor marker
  const removeDoctorMarker = (doctorID: number): void => {
    if (markers[doctorID]) {
      console.log(`🗑️ Removing marker for doctor ${doctorID}`)
      markers[doctorID].remove() // Remove from map
      delete markers[doctorID] // Remove from stored markers
    }
  }

  // Function to update doctor marker
  const updateDoctorMarker = (doctorID: number, available: boolean): void => {
    if (markers[doctorID]) {
      console.log(`🔄 Updating marker for doctor ${doctorID}, available: ${available}`)

      // Update marker icon
      markers[doctorID].setIcon(available ? greenIcon : redIcon)

      // Update popup status if it's open
      const statusElement: HTMLElement | null = document.getElementById(`doctor-${doctorID}-status`)
      if (statusElement) {
        statusElement.textContent = available ? '✅ Available' : '❌ Unavailable'
      }

      // Find and update the doctor in our data
      const doctorIndex = doctors.value.findIndex(d => d.id === doctorID)
      if (doctorIndex !== -1) {
        doctors.value[doctorIndex].availability = available
      }
    }
  }

  // Listen for SSE updates with alerts enabled
  const listenForDoctorUpdates = (): void => {
    console.log('📡 Establishing SSE connection to:', eventsEndpoint)

    const connectSSE = () => {
      eventSource = new EventSource(eventsEndpoint)

      eventSource.onopen = () => {
        console.log('✅ SSE connection established')
        alert('🔗 Real-time updates connected!')
      }

      eventSource.onmessage = (event: MessageEvent) => {
        try {
          const data: SSEEventData = JSON.parse(event.data)
          console.log('📨 Real-time update received:', data)

          // Handle different event types with alerts
          switch (data.type) {
            case 'availability':
              console.log(`🏥 Doctor ${data.doctorID} availability changed to: ${data.available}`)

              const doctor = doctors.value.find(d => d.id === data.doctorID)
              const doctorName = doctor ? doctor.name : `Doctor ${data.doctorID}`

              if (!data.available) {
                alert(`⚠️ ${doctorName} is no longer available`)
                removeDoctorMarker(data.doctorID)
              } else {
                alert(`✅ ${doctorName} is now available`)
                if (markers[data.doctorID]) {
                  updateDoctorMarker(data.doctorID, data.available)
                } else {
                  // Fetch doctor details and add the marker
                  fetchDoctorDetails(data.doctorID)
                    .then((doctor: Doctor) => addDoctorMarker(doctor))
                    .catch((err: Error) => console.error('❌ Error fetching doctor data:', err))
                }
              }
              break

            case 'connected':
              console.log('📡 SSE connection confirmed')
              alert(`📡 Connected: ${data.message || 'SSE connection established'}`)
              break

            case 'heartbeat':
              console.log('💓 SSE heartbeat received')
              // Alert for heartbeat - but less intrusive
              // alert('💓 Heartbeat received') // Uncomment if you want heartbeat alerts too
              break

            default:
              console.log('📨 Unknown SSE event type:', data.type)
              alert(`📨 Live update: ${event.data}`)
          }
        } catch (err) {
          console.error('❌ Error parsing SSE data:', err)
          alert(`❌ Error processing real-time update: ${err}`)
        }
      }

      eventSource.onerror = (event: Event) => {
        console.error('❌ SSE connection error:', event)
        alert('❌ Real-time connection lost. Attempting to reconnect...')
        eventSource?.close()

        // Reconnect after 5 seconds
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect SSE...')
          connectSSE()
        }, 5000)
      }
    }

    connectSSE()
  }

  const handleBookAppointment = async (doctorId: number): Promise<void> => {
    console.log(`📅 Booking appointment with doctor ${doctorId}`)

    // Generate a future time slot (you can replace this with a proper date picker)
    const now = new Date()
    now.setHours(now.getHours() + 1) // 1 hour from now
    const timeSlot = now.toISOString().slice(0, 19).replace('T', ' ')

    try {
      const result: BookingResult = await bookAppointment(doctorId, timeSlot)
      console.log('✅ Booking successful:', result)
      alert(`✅ ${result.message}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('❌ Booking failed:', errorMessage)
      alert('❌ Booking failed: ' + errorMessage)
    }
  }

  // Cleanup function
  const cleanup = (): void => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    if (map) {
      map.remove()
      map = null
    }
  }

  return {
    doctors,
    loading,
    error,
    initializeMap,
    cleanup,
  }
}
