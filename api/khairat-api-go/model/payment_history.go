package model

type PaymentHistory struct {
	Id          int64  `gorm:"column:id;primaryKey" json:"id"`
	MemberId    int64  `gorm:"column:member_id;primaryKey" json:"-"`
	Member      Member `gorm:"foreignKey:MemberId" json:"member"`
	Amount      int64  `gorm:"column:amount" json:"amount"`
	PaymentDate int64  `gorm:"column:payment_date" json:"paymentDate"`
	NoResit     string `gorm:"type:varchar(12)" json:"noResit"`
}

func (PaymentHistory) TableName() string {
	return "khairat_payment_history"
}
