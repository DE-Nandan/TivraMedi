// In models/doctor.go
package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

type Doctor struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Name         string    `json:"name" gorm:"type:varchar(100);not null"`
	Specialty    string    `json:"specialty" gorm:"type:varchar(100)"`
	Latitude     float64   `json:"latitude" gorm:"not null"`
	Longitude    float64   `json:"longitude" gorm:"not null"`
	Availability bool      `json:"availability" gorm:"default:true"`
	Geometry     *string   `json:"geometry,omitempty" gorm:"type:geometry(Point,4326)"` // Make nullable
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// GORM hook to auto-generate geometry from lat/lng
func (d *Doctor) BeforeCreate(tx *gorm.DB) error {
	if d.Geometry == nil {
		geom := fmt.Sprintf("POINT(%f %f)", d.Longitude, d.Latitude)
		d.Geometry = &geom
	}
	return nil
}
