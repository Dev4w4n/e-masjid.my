package model

type Dependent struct {
	Id         int64  `gorm:"column:id;primaryKey" json:"id"`
	MemberId   int64  `gorm:"column:member_id;primaryKey" json:"-"`
	PersonId   int64  `gorm:"column:person_id" json:"-"`
	Person     Person `gorm:"foreignKey:PersonId" json:"person"`
	Member     Member `gorm:"foreignKey:MemberId" json:"-"`
	HubunganId int    `gorm:"column:hubungan_id" json:"hubunganId"`
}

func (Dependent) TableName() string {
	return "dependents"
}
