package model

type Cadangan struct {
	ID            int          `db:"id" json:"id"`
	CadanganType  CadanganType `gorm:"embedded" json:"cadanganType"`
	CadanganText  string       `db:"cadangan_text" json:"cadanganText"`
	TindakanText  string       `db:"tindakan_text" json:"tindakanText"`
	CadanganNama  string       `db:"cadangan_nama" json:"cadanganNama"`
	CadanganEmail string       `db:"cadangan_email" json:"cadanganEmail"`
	CadanganPhone string       `db:"cadangan_phone" json:"cadanganPhone"`
	IsOpen        bool         `db:"is_open" json:"isOpen"`
	Score         int          `db:"score" json:"score"`
	CreateDate    int64        `db:"create_date" json:"createDate"`
}
