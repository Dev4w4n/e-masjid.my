package model

import (
	gorm2 "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"
)

type UploadedFilesCdn struct {
	gorm.Model         `swaggerignore:"true"`
	Id                 int64  `gorm:"column:id;primaryKey" json:"id"`
	CdnId              int64  `gorm:"column:cdn_id" json:"-"`
	Path               string `gorm:"column:path" json:"path"`
	CreateDate         int64  `gorm:"column:create_date" json:"createDate"`
	TableReference     string `gorm:"column:table_reference" json:"tableReference"`
	MarkAsDelete       bool   `gorm:"column:mark_as_delete" json:"markAsDelete"`
	gorm2.MultiTenancy `swaggerignore:"true"`
}

func (UploadedFilesCdn) TableName() string {
	return "uploaded_files_cdn"
}