package model

import (
	gorm2 "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"
)

type KariahMember struct {
	ID                  uint `gorm:"column:id;primaryKey" json:"id"`
	PersonID            uint `gorm:"column:person_id" json:"personId"`
	BangsaID            uint `gorm:"column:bangsa_id" json:"bangsaId"`
	PekerjaanID         uint `gorm:"column:pekerjaan_id" json:"pekerjaanId"`
	WarganegaraID       uint `gorm:"column:warganegara_id" json:"warganegaraId"`
	StatusPerkahwinanID uint `gorm:"column:status_perkahwinan_id" json:"statusPerkahwinanId"`
	IsKhairatKematian   bool `gorm:"column:is_khairat_kematian" json:"isKhairatKematian"`
	IsOKU               bool `gorm:"column:is_oku" json:"isOKU"`
	FileIDBilUtiliti    uint `gorm:"column:file_id_bil_utiliti" json:"fileIdBilUtiliti"`
	FileIDGambar        uint `gorm:"column:file_id_gambar" json:"fileIdGambar"`
	gorm.Model          `swaggerignore:"true"`
	gorm2.MultiTenancy  `swaggerignore:"true"`
}

func (KariahMember) TableName() string {
	return "kariah_members"
}
