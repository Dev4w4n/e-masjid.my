package model

type Cadangan struct {
	ID             int          `gorm:"column:id;primaryKey" json:"id"`
	CadanganTypeID int          `gorm:"column:cadangan_types_id" json:"-"`
	CadanganType   CadanganType `gorm:"foreignKey:CadanganTypeID" json:"cadanganType"`
	CadanganText   string       `gorm:"column:cadangan_text" json:"cadanganText"`
	TindakanText   string       `gorm:"column:tindakan_text" json:"tindakanText"`
	CadanganNama   string       `gorm:"column:cadangan_nama" json:"cadanganNama"`
	CadanganEmail  string       `gorm:"column:cadangan_email" json:"cadanganEmail"`
	CadanganPhone  string       `gorm:"column:cadangan_phone" json:"cadanganPhone"`
	IsOpen         bool         `gorm:"column:is_open" json:"isOpen"`
	Score          int          `gorm:"column:score" json:"score"`
	CreateDate     int64        `gorm:"column:create_date" json:"createDate"`
}

func (Cadangan) TableName() string {
	return "cadangan"
}
