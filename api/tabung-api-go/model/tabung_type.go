package model

type TabungType struct {
	Id   int64  `gorm:"column:id;primaryKey" json:"id"`
	Name string `gorm:"column:name" json:"name"`
}

func (TabungType) TableName() string {
	return "tabung_types"
}
