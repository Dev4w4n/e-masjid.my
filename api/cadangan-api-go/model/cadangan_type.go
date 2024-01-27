package model

type CadanganType struct {
	ID   int    `gorm:"column:id;primaryKey" json:"id"`
	Name string `gorm:"column:name" json:"name"`
}

func (CadanganType) TableName() string {
	return "cadangan_types"
}
