package model

type TetapanType struct {
	GroupName string `gorm:"column:group_name" json:"type"`
	IntVal    int    `gorm:"column:int_val" json:"value"`
	StrVal    string `gorm:"column:str_val" json:"label"`
}

type TetapanTypeGroupNames struct {
	Groups []string `json:"group_names"`
}

func (TetapanType) TableName() string {
	return "tetapan_types"
}
