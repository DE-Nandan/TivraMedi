package models

type Doctor struct {
	ID           uint    `gorm:"primaryKey"`
	Name         string  `gorm:"size:100;not null"`
	Specialty    string  `gorm:"size:100"`
	Latitude     float64 `gorm:"not null"`
	Longitude    float64 `gorm:"not null"`
	Availability bool    `gorm:"default:true"`              // Default to available
	Geometry     string  `gorm:"type:geometry(Point,4326)"` // Use PostGIS for spatial data
}
