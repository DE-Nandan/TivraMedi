package database

import (
	"log"

	"tivramedi/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB // Global DB connection

func ConnectDatabase() {
	// Replace with your actual PostgreSQL credentials
	dsn := "host=localhost user=postgres password=112103 dbname=tivramedi port=5432 sslmode=disable TimeZone=Asia/Kolkata"
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to the database: ", err)
	}
	log.Println("Database connected successfully!")

	log.Println(&models.Doctor{})
	err = DB.AutoMigrate(&models.Doctor{}, &models.Booking{})
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}
	log.Println("Database migrated successfully!")
}
