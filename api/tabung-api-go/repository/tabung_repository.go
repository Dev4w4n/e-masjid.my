package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	"gorm.io/gorm"
)

type TabungRepository interface {
	FindAll() ([]model.Tabung, error)
	FindById(id int64) (model.Tabung, error)
	Save(tabung model.Tabung) (model.Tabung, error)
	Delete(id int64) error
}

type TabungRepositoryImpl struct {
	Db *gorm.DB
}

func NewTabungRepository(db *gorm.DB) TabungRepository {
	db.AutoMigrate(&model.Tabung{})

	return &TabungRepositoryImpl{Db: db}
}

// FindAll implements TabungRepository.
func (repo *TabungRepositoryImpl) FindAll() ([]model.Tabung, error) {
	var tabungList []model.Tabung
	result := repo.Db.
		Preload("TabungType").
		Find(&tabungList)

	if result.Error != nil {
		return nil, result.Error
	}

	return tabungList, nil
}

// FindById implements TabungRepository.
func (repo *TabungRepositoryImpl) FindById(id int64) (model.Tabung, error) {
	var tabung model.Tabung
	result := repo.Db.
		Preload("TabungType").
		First(&tabung, "id = ?", id)

	if result.Error != nil {
		return model.Tabung{}, result.Error
	}

	return tabung, nil
}

// Save implements TabungRepository.
func (repo *TabungRepositoryImpl) Save(tabung model.Tabung) (model.Tabung, error) {
	result := repo.Db.Save(&tabung)

	if result.Error != nil {
		return model.Tabung{}, result.Error
	}

	tabung, err := repo.FindById(tabung.Id)

	if err != nil {
		return model.Tabung{}, err
	}

	return tabung, nil
}

// Delete implements TabungRepository.
func (repo *TabungRepositoryImpl) Delete(id int64) error {
	var tabung model.Tabung
	result := repo.Db.Where("id = ?", id).Delete(&tabung)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
