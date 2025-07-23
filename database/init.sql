-- Enable PostGIS extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verify PostGIS is installed
SELECT PostGIS_version();

-- Test geometry type creation
CREATE TABLE IF NOT EXISTS test_geometry (
    id SERIAL PRIMARY KEY,
    location geometry(Point,4326)
);

-- Clean up test table
DROP TABLE IF EXISTS test_geometry;

-- Log successful PostGIS setup
DO $$ 
BEGIN 
    RAISE NOTICE 'PostGIS extensions enabled successfully!';
END $$;
