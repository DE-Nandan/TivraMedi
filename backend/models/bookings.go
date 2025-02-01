package models

import (
	"gorm.io/gorm"
)

type Booking struct {
	ID         uint   `gorm:"primaryKey"`
	DoctorID   uint   `gorm:"not null"`
	CustomerID uint   `gorm:"not null"` // Can be "dummy_customer" for now
	TimeSlot   string `gorm:"not null"`
	CreatedAt  string `gorm:"not null"`
	UpdatedAt  string `gorm:"not null"`
}

func MigrateBooking(db *gorm.DB) {
	db.AutoMigrate(&Booking{})
}
