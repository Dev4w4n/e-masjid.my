package model

type TetapanType struct {
	Id        int    `gorm:"column:id;primary_key" json:"id"`
	GroupName string `gorm:"column:group_name" json:"group_name"`
	IntVal    int    `gorm:"column:int_val" json:"int_val"`
	StrVal    string `gorm:"column:str_val" json:"str_val"`
}

type TetapanTypeGroupNames struct {
	Groups []string `json:"group_names"`
}

func (TetapanType) TableName() string {
	return "tetapan_types"
}
