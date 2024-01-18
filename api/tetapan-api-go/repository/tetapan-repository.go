package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api-go/model"
	"gorm.io/gorm"
)

type TetapanRepository interface {
	FindAll() ([]model.Tetapan, error)
	FindByKunci(kunci string) (model.Tetapan, error)
	Save(tetapan model.Tetapan) error
	SaveAll(tetapanList []model.Tetapan) error
}

type TetapanRepositoryImpl struct {
	Db *gorm.DB
}

func NewTetapanRepository(db *gorm.DB) TetapanRepository {
	db.AutoMigrate(&model.Tetapan{})

	return &TetapanRepositoryImpl{Db: db}
}

func (repo TetapanRepositoryImpl) FindAll() ([]model.Tetapan, error) {
	return nil, nil
}

func (repo TetapanRepositoryImpl) FindByKunci(kunci string) (model.Tetapan, error) {
	return model.Tetapan{}, nil
}

func (repo TetapanRepositoryImpl) Save(tetapan model.Tetapan) error {
	return nil
}

func (repo TetapanRepositoryImpl) SaveAll(tetapanList []model.Tetapan) error {
	return nil
}
