-- Enable PostGIS extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Set timezone for the database
ALTER DATABASE tivramedi SET timezone TO 'Asia/Kolkata';

-- Create doctors table matching the Go model exactly
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,                                          -- matches uint ID
    name VARCHAR(100) NOT NULL,                                     -- matches Name
    specialty VARCHAR(100),                                         -- matches Specialty  
    latitude DOUBLE PRECISION NOT NULL,                             -- matches float64 Latitude
    longitude DOUBLE PRECISION NOT NULL,                            -- matches float64 Longitude
    availability BOOLEAN DEFAULT true,                              -- matches Availability
    geometry geometry(Point,4326),                                  -- matches *string Geometry (nullable)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                 -- matches CreatedAt
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP                  -- matches UpdatedAt
);

-- Create bookings table matching the Go model exactly
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,                                          -- matches uint ID
    doctor_id INTEGER NOT NULL,                                     -- matches uint DoctorID
    customer VARCHAR(255) NOT NULL DEFAULT 'dummy_customer',        -- matches Customer with default
    time_slot VARCHAR(255) NOT NULL,                               -- matches TimeSlot
    created_at BIGINT                                               -- matches int64 CreatedAt (Unix timestamp)
);

-- Add foreign key constraint for bookings table
ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_doctor 
FOREIGN KEY (doctor_id) REFERENCES doctors(id);

-- Insert sample data with auto-generated geometry using PostGIS functions
INSERT INTO doctors (name, specialty, latitude, longitude, availability, geometry, created_at, updated_at) VALUES
('Dr. John Smith', 'Cardiologist', 40.7128, -74.0060, true, 
 ST_SetSRID(ST_MakePoint(-74.0060, 40.7128), 4326), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Dr. Sarah Johnson', 'General Practice', 40.7614, -73.9776, true, 
 ST_SetSRID(ST_MakePoint(-73.9776, 40.7614), 4326), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Dr. Mike Wilson', 'Pediatrics', 40.7505, -73.9934, false, 
 ST_SetSRID(ST_MakePoint(-73.9934, 40.7505), 4326), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Dr. Emily Chen', 'Dermatology', 40.7282, -74.0776, true, 
 ST_SetSRID(ST_MakePoint(-74.0776, 40.7282), 4326), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Dr. Michael Brown', 'Orthopedics', 40.7589, -73.9851, true, 
 ST_SetSRID(ST_MakePoint(-73.9851, 40.7589), 4326), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Dr. Lisa Wang', 'Neurology', 40.7406, -74.0018, false, 
 ST_SetSRID(ST_MakePoint(-74.0018, 40.7406), 4326), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING; -- Prevent duplicates if script runs multiple times

-- Insert sample booking data
INSERT INTO bookings (doctor_id, customer, time_slot, created_at) VALUES
(1, 'John Doe', '2024-01-15 09:00:00', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT),
(2, 'Jane Smith', '2024-01-15 10:30:00', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT),
(3, 'Bob Johnson', '2024-01-16 14:00:00', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT)
ON CONFLICT (id) DO NOTHING;

-- Log successful completion
DO $$ 
BEGIN 
    RAISE NOTICE 'PostGIS extensions enabled successfully!';
    RAISE NOTICE 'Sample doctor data with geometry inserted successfully!';
    RAISE NOTICE 'Sample booking data inserted successfully!';
    RAISE NOTICE 'Database initialization completed!';
END $$;
