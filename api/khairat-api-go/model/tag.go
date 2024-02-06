package model

type Tag struct {
	Id   int64  `gorm:"column:id;primaryKey" json:"id"`
	Name string `gorm:"type:varchar(12)" json:"name"`
}

func (Tag) TableName() string {
	return "tags"
}
