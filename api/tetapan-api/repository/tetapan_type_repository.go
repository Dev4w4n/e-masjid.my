package repository

import (
	"strings"

	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/model"
	"gorm.io/gorm"
)

type TetapanTypeRepository interface {
	FindAllGroupNames() (model.TetapanTypeGroupNames, error)
	FindByGroupName(kunci string) ([]model.TetapanType, error)
}

type TetapanTypeRepositoryImpl struct {
	Db *gorm.DB
}

func NewTetapanTypeRepository(db *gorm.DB) TetapanTypeRepository {
	db.AutoMigrate(&model.TetapanType{})

	return &TetapanTypeRepositoryImpl{Db: db}
}

func (repo *TetapanTypeRepositoryImpl) FindAllGroupNames() (model.TetapanTypeGroupNames, error) {
	var distinctValues []string

	result := repo.Db.Model(&model.TetapanType{}).Distinct("group_name").Pluck("group_name", &distinctValues)

	if result.Error != nil {
		return model.TetapanTypeGroupNames{}, result.Error
	}

	groupNames := model.TetapanTypeGroupNames{Groups: distinctValues}

	return groupNames, nil
}

func (repo *TetapanTypeRepositoryImpl) FindByGroupName(groupName string) ([]model.TetapanType, error) {
	var tetapanTypes []model.TetapanType

	result := repo.Db.Where("UPPER(group_name) = ?", strings.ToUpper(groupName)).Find(&tetapanTypes)

	if result.Error != nil {
		return []model.TetapanType{}, result.Error
	}

	return tetapanTypes, nil
}
