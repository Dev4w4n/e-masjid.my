package model

type Tag struct {
	Id   int    `gorm:"column:id;primaryKey" json:"id"`
	Name string `gorm:"type:varchar(12)" json:"name"`
}

func (Tag) TableName() string {
	return "tags"
}
