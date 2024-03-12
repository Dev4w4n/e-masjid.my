package model

type Member struct {
	Id             int64            `gorm:"column:id;primaryKey" json:"id"`
	PersonId       int64            `gorm:"column:person_id" json:"-"`
	Person         Person           `gorm:"foreignKey:PersonId" json:"person"`
	MemberTags     []MemberTag      `gorm:"foreignKey:MemberId" json:"memberTags"`
	Dependents     []Dependent      `gorm:"foreignKey:MemberId" json:"dependents"`
	PaymentHistory []PaymentHistory `gorm:"foreignKey:MemberId" json:"paymentHistories"`
}

func (Member) TableName() string {
	return "members"
}
