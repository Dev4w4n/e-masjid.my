package model

type Tabung struct {
	Id           int64      `gorm:"column:id;primaryKey" json:"id"`
	Name         string     `gorm:"column:name" json:"name"`
	IsCents      bool       `gorm:"column:is_cents" json:"cents"`
	TabungTypeId int64      `gorm:"column:tabung_types_id" json:"-"`
	TabungType   TabungType `gorm:"foreignKey:TabungTypeId" json:"tabungType"`
}

func (Tabung) TableName() string {
	return "tabung"
}
