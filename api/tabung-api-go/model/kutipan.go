package model

type Kutipan struct {
	Id int64 `gorm:"column:id;primary_key" json:"id"`
}

func (Kutipan) TableName() string {
	return "kutipan"
}
