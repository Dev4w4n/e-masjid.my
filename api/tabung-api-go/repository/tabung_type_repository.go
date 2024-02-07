package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	"gorm.io/gorm"
)

type TabungTypeRepository interface {
	FindAll() ([]model.TabungType, error)
	Save(tabungType model.TabungType) error
	Delete(id int64) error
}

type TabungTypeRepositoryImpl struct {
	Db *gorm.DB
}

func NewTabungTypeRepository(db *gorm.DB) TabungTypeRepository {
	db.AutoMigrate(&model.TabungType{})

	return &TabungTypeRepositoryImpl{Db: db}
}

// FindAll implements TabungTypeRepository.
func (repo *TabungTypeRepositoryImpl) FindAll() ([]model.TabungType, error) {
	var tabungTypeList []model.TabungType
	result := repo.Db.Find(&tabungTypeList)

	if result.Error != nil {
		return nil, result.Error
	}

	return tabungTypeList, nil
}

// Save implements TabungTypeRepository.
func (repo *TabungTypeRepositoryImpl) Save(tabungType model.TabungType) error {
	result := repo.Db.Save(tabungType)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// Delete implements TabungTypeRepository.
func (repo *TabungTypeRepositoryImpl) Delete(id int64) error {
	var tabungType model.TabungType
	result := repo.Db.Where("id = ?", id).Delete(&tabungType)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
