package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	"gorm.io/gorm"
)

type KutipanRepository interface {
	FindAllByTabungId(tabungId int64) ([]model.Kutipan, error)
	FindAllByTabungIdBetweenCreateDate(params model.QueryParams, paginate model.Paginate) (model.Response, error)
	FindById(id int64) (model.Kutipan, error)
	Upsert(kutipan model.Kutipan) (model.Kutipan, error)
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
	result := repo.Db.
		Order("id desc").
		Where("tabung_id = ?", tabungId).
		Preload("Tabung.TabungType").
		Find(&kutipanList)

	if result.Error != nil {
		return nil, result.Error
	}

	for i, kutipan := range kutipanList {
		sumTotal(&kutipan)
		kutipanList[i] = kutipan
	}

	return kutipanList, nil
}

// FindAllByTabungIdBetweenCreateDate implements KutipanRepository.
func (repo *KutipanRepositoryImpl) FindAllByTabungIdBetweenCreateDate(params model.QueryParams, paginate model.Paginate) (model.Response, error) {
	var response model.Response
	var kutipanList []model.Kutipan
	var total int64
	var result *gorm.DB
	offset := (paginate.Page - 1) * paginate.Size

	if paginate.Page == 0 && paginate.Size == 0 {
		result = repo.Db.
			Order("id").
			Where("tabung_id = ? AND create_date BETWEEN ? AND ?", params.TabungId, params.FromDate, params.ToDate).
			Preload("Tabung.TabungType").
			Find(&kutipanList)

	} else {
		result = repo.Db.
			Offset(offset).
			Limit(paginate.Size).
			Order("id").
			Where("tabung_id = ? AND create_date BETWEEN ? AND ?", params.TabungId, params.FromDate, params.ToDate).
			Preload("Tabung.TabungType").
			Find(&kutipanList)

	}

	if result.Error != nil {
		return response, result.Error
	}

	repo.Db.Model(&model.Kutipan{}).
		Where("tabung_id = ? AND create_date BETWEEN ? AND ?", params.TabungId, params.FromDate, params.ToDate).
		Count(&total)

	for i, kutipan := range kutipanList {
		sumTotal(&kutipan)
		kutipanList[i] = kutipan
	}

	response.Content = kutipanList
	response.Total = int(total)

	return response, nil
}

// FindById implements KutipanRepository.
func (repo *KutipanRepositoryImpl) FindById(id int64) (model.Kutipan, error) {
	var kutipan model.Kutipan
	result := repo.Db.
		Preload("Tabung.TabungType").
		First(&kutipan, "id = ?", id)

	if result.Error != nil {
		return model.Kutipan{}, result.Error
	}

	sumTotal(&kutipan)

	return kutipan, nil
}

// Save implements KutipanRepository.
func (repo *KutipanRepositoryImpl) Save(kutipan model.Kutipan) (model.Kutipan, error) {
	result := repo.Db.Save(&kutipan)

	if result.Error != nil {
		return model.Kutipan{}, result.Error
	}

	kutipan, err := repo.FindById(kutipan.Id)

	if err != nil {
		return model.Kutipan{}, err
	}

	return kutipan, nil
}

// Save and Update implements KutipanRepository.
func (repo *KutipanRepositoryImpl) Upsert(kutipan model.Kutipan) (model.Kutipan, error) {
	var result *gorm.DB

	if kutipan.Id > 0 {
		result = repo.Db.Omit("tabung_id").Updates(&kutipan)
	} else {
		result = repo.Db.Save(&kutipan)
	}

	if result.Error != nil {
		return model.Kutipan{}, result.Error
	}

	_kutipan, err := repo.FindById(kutipan.Id)
	if err != nil {
		return model.Kutipan{}, err
	}

	return _kutipan, nil
}

func sumTotal(kutipan *model.Kutipan) {
	kutipan.Total = float64(kutipan.Total1c)*0.01 +
		float64(kutipan.Total5c)*0.05 +
		float64(kutipan.Total10c)*0.1 +
		float64(kutipan.Total20c)*0.2 +
		float64(kutipan.Total50c)*0.5 +
		float64(kutipan.Total1d) +
		float64(kutipan.Total5d)*5 +
		float64(kutipan.Total10d)*10 +
		float64(kutipan.Total20d)*20 +
		float64(kutipan.Total50d)*50 +
		float64(kutipan.Total100d)*100
}
