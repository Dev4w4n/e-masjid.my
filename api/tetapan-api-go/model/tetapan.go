package model

type Tetapan struct {
	Kunci string `gorm:"type:varchar(24);primary_key" json:"kunci"`
	Nilai string `gorm:"type:varchar(256)" json:"nilai"`
}

func (Tetapan) TableName() string {
	return "tetapan"
}
