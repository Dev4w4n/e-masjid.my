package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	"gorm.io/gorm"
)

type KutipanRepository interface {
	FindAllByTabungId(tabungId int64) ([]model.Kutipan, error)
	FindAllByTabungIdBetweenCreateDate(tabungId int64, fromDate int64, toDate int64) ([]model.Kutipan, error)
	FindById(id int64) (model.Kutipan, error)
	Save(kutipan model.Kutipan) error
}

type KutipanRepositoryImpl struct {
	Db *gorm.DB
}

func NewKutipanRepository(db *gorm.DB) KutipanRepository {
	db.AutoMigrate(&model.Kutipan{})

	return &KutipanRepositoryImpl{Db: db}
}

// FindAllByTabungId implements KutipanRepository.
func (repo *KutipanRepositoryImpl) FindAllByTabungId(tabungId int64) ([]model.Kutipan, error) {
	var kutipanList []model.Kutipan
	result := repo.Db.Find(&kutipanList)

	if result.Error != nil {
		return nil, result.Error
	}

	return kutipanList, nil
}

// FindAllByTabungIdBetweenCreateDate implements KutipanRepository.
func (repo *KutipanRepositoryImpl) FindAllByTabungIdBetweenCreateDate(tabungId int64, fromDate int64, toDate int64) ([]model.Kutipan, error) {
	var kutipanList []model.Kutipan
	result := repo.Db.Find(&kutipanList)

	if result.Error != nil {
		return nil, result.Error
	}

	return kutipanList, nil
}

// FindById implements KutipanRepository.
func (repo *KutipanRepositoryImpl) FindById(id int64) (model.Kutipan, error) {
	var kutipan model.Kutipan
	result := repo.Db.First(&kutipan, "id = ?", id)

	if result.Error != nil {
		return model.Kutipan{}, result.Error
	}

	return kutipan, nil
}

// Save implements KutipanRepository.
func (repo *KutipanRepositoryImpl) Save(kutipan model.Kutipan) error {
	result := repo.Db.Save(kutipan)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
