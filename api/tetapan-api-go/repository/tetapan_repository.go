package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/model"
	"gorm.io/gorm"
)

type TetapanRepository interface {
	FindAll() ([]model.Tetapan, error)
	FindByKunci(kunci string) (model.Tetapan, error)
	Save(tetapan model.Tetapan) error
	SaveAll(tetapanList []model.Tetapan) error
	Delete(kunci string) error
}

type TetapanRepositoryImpl struct {
	Db *gorm.DB
}

func NewTetapanRepository(db *gorm.DB) TetapanRepository {
	db.AutoMigrate(&model.Tetapan{})

	return &TetapanRepositoryImpl{Db: db}
}

func (repo *TetapanRepositoryImpl) FindAll() ([]model.Tetapan, error) {
	var tetapanList []model.Tetapan
	result := repo.Db.Find(&tetapanList)

	if result.Error != nil {
		return nil, result.Error
	}

	return tetapanList, nil
}

func (repo *TetapanRepositoryImpl) FindByKunci(kunci string) (model.Tetapan, error) {
	var tetapan model.Tetapan
	result := repo.Db.First(&tetapan, "kunci = ?", kunci)

	if result.Error != nil {
		return model.Tetapan{}, result.Error
	}

	return tetapan, nil
}

func (repo *TetapanRepositoryImpl) Save(tetapan model.Tetapan) error {
	result := repo.Db.Save(tetapan)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

func (repo *TetapanRepositoryImpl) SaveAll(tetapanList []model.Tetapan) error {
	result := repo.Db.Save(tetapanList)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

func (repo *TetapanRepositoryImpl) Delete(kunci string) error {
	var tetapan model.Tetapan
	result := repo.Db.Where("kunci = ?", kunci).Delete(&tetapan)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
