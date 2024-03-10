package model

type Kutipan struct {
	Id         int64   `gorm:"column:id;primaryKey" json:"id"`
	TabungId   int64   `gorm:"column:tabung_id" json:"-"`
	Tabung     Tabung  `gorm:"foreignKey:TabungId" json:"tabung"`
	Total1c    int     `gorm:"column:total1c" json:"total1c"`
	Total5c    int     `gorm:"column:total5c" json:"total5c"`
	Total10c   int     `gorm:"column:total10c" json:"total10c"`
	Total20c   int     `gorm:"column:total20c" json:"total20c"`
	Total50c   int     `gorm:"column:total50c" json:"total50c"`
	Total1d    int     `gorm:"column:total1d" json:"total1d"`
	Total5d    int     `gorm:"column:total5d" json:"total5d"`
	Total10d   int     `gorm:"column:total10d" json:"total10d"`
	Total20d   int     `gorm:"column:total20d" json:"total20d"`
	Total50d   int     `gorm:"column:total50d" json:"total50d"`
	Total100d  int     `gorm:"column:total100d" json:"total100d"`
	Total      float64 `gorm:"-" json:"total"`
	CreateDate int64   `gorm:"column:create_date" json:"createDate"`
}

func (Kutipan) TableName() string {
	return "kutipan"
}
