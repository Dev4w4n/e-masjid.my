package model

type Tetapan struct {
	Kunci string `gorm:"primaryKey type:varchar(24)" json:"kunci"`
	Nilai string `gorm:"type:varchar(256)" json:"nilai"`
}

func (Tetapan) TableName() string {
	return "tetapan"
}
