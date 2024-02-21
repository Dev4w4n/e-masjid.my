package model

type Tabung struct {
	Id         int64       `gorm:"column:id;primary_key" json:"id"`
	Name       string      `gorm:"column:name" json:"name"`
	IsCents    bool        `gorm:"column:is_cents" json:"isCents"`
	TabungType *TabungType `gorm:"foreignKey:tabung_types_id`
}

func (Tabung) TableName() string {
	return "tabung"
}
