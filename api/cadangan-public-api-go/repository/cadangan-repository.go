package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-public-api/model"
	"gorm.io/gorm"
)

type CadanganRepository interface {
	Save(cadangan model.Cadangan) error
}

type CadanganRepositoryImpl struct {
	Db *gorm.DB
}

func NewCadanganRepository(db *gorm.DB) CadanganRepository {
	db.AutoMigrate(&model.Cadangan{})

	return &CadanganRepositoryImpl{Db: db}
}

func (repo *CadanganRepositoryImpl) Save(cadangan model.Cadangan) error {
	result := repo.Db.Save(&cadangan)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
