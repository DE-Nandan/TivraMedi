package models

import (
	"gorm.io/gorm"
)

type Booking struct {
	ID        uint   `gorm:"primaryKey"`
	DoctorID  uint   `gorm:"not null"`
	Customer  string `gorm:"not null;default:'dummy_customer'"` // Simplified
	TimeSlot  string `gorm:"not null"`                          // Keep as string for now
	CreatedAt int64  // Unix timestamp
}

func MigrateBooking(db *gorm.DB) {
	db.AutoMigrate(&Booking{})
}
