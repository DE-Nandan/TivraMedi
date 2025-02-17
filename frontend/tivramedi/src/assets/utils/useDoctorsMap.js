import { ref } from 'vue';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Default Leaflet marker icon setup
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

var greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});





export default function useDoctorsMap() {
  const doctors = ref([]);
  const loading = ref(true);
  const error = ref(null);
  let map = null; // Store the map instance

  let markers = {}; 

  const initializeMap = async (containerId) => {
    try {
      // Ensure the DOM is ready
      const mapContainer = document.getElementById(containerId);
      if (!mapContainer) {
        throw new Error("Map container not found");
      }

      // Get user's current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      // Prevent duplicate maps
      if (!map) {
        map = L.map(containerId).setView(
          [position.coords.latitude, position.coords.longitude],
          13
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
      }

      // Add user's location marker
      L.marker([position.coords.latitude, position.coords.longitude], {
        icon: defaultIcon
      })
      .bindPopup('Your Location')
      .addTo(map);

      // Fetch doctors from the backend
      const response = await axios.get('http://localhost:8080/doctors');
      //doctors.value = response.data;
      console.log(response.data)
      doctors.value = response.data.filter(doctor => doctor.Availability);
      
      doctors.value.forEach(doctor => addDoctorMarker(doctor));

       // Start listening for real-time updates
       listenForDoctorUpdates();
      // Add doctor markers to map
      // doctors.value.forEach(doctor => {
      //   const marker = L.marker([doctor.Latitude, doctor.Longitude], {
      //     icon: greenIcon
      //   });
      //   const popupContent = `
      //     <div class="doctor-popup">
      //       <h3>${doctor.Name}</h3>
      //       <p><strong>Specialty:</strong> ${doctor.Specialty}</p>
      //       <p><strong>Status:</strong> <span id="doctor-${doctor.ID}-status">${doctor.Availability ? '✅ Available' : '❌ Unavailable'}</span></p>
      //       <button class="book-btn" onclick="bookAppointment(${doctor.ID})">Book</button>
      //     </div>
      //   `;

      
      // marker.bindPopup(popupContent).addTo(map);
       
      //   // Bind the bookAppointment function to the button inside the popup
      //   marker.on('popupopen', () => {
      //     const bookButton = marker.getPopup().getElement().querySelector('.book-btn');
      //     if (bookButton) {
      //       bookButton.onclick = () => bookAppointment(doctor.ID);
      //     }
      //   });
      // });

    } catch (err) {
      error.value = 'Error loading map: ' + err.message;
    } finally {
      loading.value = false;
    }
  };


  // Function to add a doctor marker
  const addDoctorMarker = (doctor) => {
    if (markers[doctor.ID]) return;  // Prevent duplicate markers

    const marker = L.marker([doctor.Latitude, doctor.Longitude], {
      icon: greenIcon
    });

    const popupContent = `
      <div class="doctor-popup">
        <h3>${doctor.Name}</h3>
        <p><strong>Specialty:</strong> ${doctor.Specialty}</p>
        <p><strong>Status:</strong> <span id="doctor-${doctor.ID}-status">${doctor.Availability ? '✅ Available' : '❌ Unavailable'}</span></p>
        <button class="book-btn" onclick="bookAppointment(${doctor.ID})">Book</button>
      </div>
    `;

    marker.bindPopup(popupContent).addTo(map);
    markers[doctor.ID] = marker; // Store marker

    // Bind the bookAppointment function to the button inside the popup
    marker.on('popupopen', () => {
      const bookButton = marker.getPopup().getElement().querySelector('.book-btn');
      if (bookButton) {
        bookButton.onclick = () => bookAppointment(doctor.ID);
      }
    });
  };


    // Function to remove a doctor marker
    const removeDoctorMarker = (doctorID) => {
      if (markers[doctorID]) {
        markers[doctorID].remove(); // Remove from map
        delete markers[doctorID]; // Remove from stored markers
      }
    };




     // Listen for SSE updates
  const listenForDoctorUpdates = () => {
    const eventSource = new EventSource('http://localhost:8080/events');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data); // Assuming JSON response
      console.log('Real-time update:', data);

      // Update UI
      const statusElement = document.getElementById(`doctor-${data.doctorID}-status`);
      if (statusElement) {
        statusElement.textContent = data.available ? '✅ Available' : '❌ Unavailable';
      }

      // Remove or add marker based on availability
      if (!data.available) {
        removeDoctorMarker(data.doctorID);
      } else {
        // Fetch doctor details and add the marker
        axios.get(`http://localhost:8080/doctors/${data.doctorID}`)
          .then(response => addDoctorMarker(response.data))
          .catch(err => console.error("Error fetching doctor data:", err));
      }
    };
  };




   const bookAppointment = async (doctorId) => {
    const timeSlot = "2023-08-15 10:00";  // Replace with actual time slot selection logic
    console.log(doctorId)
    try {
      const response = await axios.post('http://localhost:8080/book', {
        doctor_id: doctorId,
        time_slot: timeSlot
      });
      alert(response.data.message);  // Display success message
    } catch (err) {
      alert('Booking failed: ' + err.message);  // Display error message
    }
  };

  return {
    doctors,
    loading,
    error,
    initializeMap
  };
}
