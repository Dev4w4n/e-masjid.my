package model

type Dependent struct {
	MemberId int    `gorm:"column:member_id;primaryKey" json:"-"`
	PersonId int    `gorm:"column:person_id" json:"-"`
	Person   Person `gorm:"foreignKey:PersonId" json:"person"`
	Member   Member `gorm:"foreignKey:MemberId" json:"member"`
}

func (Dependent) TableName() string {
	return "dependents"
}
