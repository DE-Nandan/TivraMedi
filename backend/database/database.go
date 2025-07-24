package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"tivramedi/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB // Global DB connection

func ConnectDatabase() {
	// Get database configuration from environment variables with fallbacks
	host := os.Getenv("POSTGRES_HOST")
	if host == "" {
		host = "localhost" // Fallback for local development
	}

	port := os.Getenv("POSTGRES_PORT")
	if port == "" {
		port = "5432"
	}

	user := os.Getenv("POSTGRES_USER")
	if user == "" {
		user = "postgres"
	}

	password := os.Getenv("POSTGRES_PASSWORD")
	if password == "" {
		password = "112103" // Your existing password as fallback
	}

	dbname := os.Getenv("POSTGRES_DB")
	if dbname == "" {
		dbname = "tivramedi"
	}

	// Build connection string with your timezone
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Kolkata",
		host, user, password, dbname, port)

	// Configure GORM with logger
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// Connect to database with retries (important for Docker startup timing)
	var err error
	for i := 0; i < 10; i++ {
		DB, err = gorm.Open(postgres.Open(dsn), gormConfig)
		if err == nil {
			break
		}

		log.Printf("Failed to connect to database (attempt %d/10): %v", i+1, err)
		time.Sleep(time.Second * 5)
	}

	if err != nil {
		log.Fatal("Failed to connect to the database after 10 attempts: ", err)
	}

	log.Println("Database connected successfully!")

	// Auto-migrate database schema
	log.Println("Running database migrations...")
	err = DB.AutoMigrate(&models.Doctor{}, &models.Booking{})
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}
	log.Println("Database migrated successfully!")

}
