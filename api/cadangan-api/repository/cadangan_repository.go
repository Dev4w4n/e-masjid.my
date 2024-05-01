package repository

import (
	"errors"

	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/model"
	"gorm.io/gorm"
)

type CadanganRepository interface {
	GetOne(id int) (model.Cadangan, error)
	GetCadanganById(id int, isOpen bool, paginate model.Paginate) (model.Response, error)
	GetCadanganByIsOpen(isOpen bool, paginate model.Paginate) (model.Response, error)
	GetTotalCadanganByTypeCount() (interface{}, error)
	Save(cadangan model.Cadangan) error
	Delete(id int) error
}

type CadanganRepositoryImpl struct {
	Db *gorm.DB
}

func NewCadanganRepository(db *gorm.DB) CadanganRepository {
	db.AutoMigrate(&model.Cadangan{})

	return &CadanganRepositoryImpl{Db: db}
}

func (repo *CadanganRepositoryImpl) GetOne(id int) (model.Cadangan, error) {
	var cadangan model.Cadangan
	result := repo.Db.Where("id = ?", id).Preload("CadanganType").First(&cadangan)

	if result.Error != nil {
		return model.Cadangan{}, result.Error
	}

	return cadangan, nil
}

func (repo *CadanganRepositoryImpl) GetCadanganById(id int, isOpen bool, paginate model.Paginate) (model.Response, error) {
	var response model.Response
	var cadangan []model.Cadangan
	var total int64

	offset := (paginate.Page - 1) * paginate.Size
	result := repo.Db.Offset(offset).Limit(paginate.Size).Where("cadangan_types_id = ? AND is_open = ?", id, isOpen).Order("id").Preload("CadanganType").Find(&cadangan)
	repo.Db.Model(&model.Cadangan{}).Where("cadangan_types_id = ? AND is_open = ?", id, isOpen).Count(&total)

	if result.Error != nil {
		return response, result.Error
	}

	response.Content = cadangan
	response.Total = int(total)

	return response, nil
}

func (repo *CadanganRepositoryImpl) GetCadanganByIsOpen(isOpen bool, paginate model.Paginate) (model.Response, error) {
	var response model.Response
	var cadangan []model.Cadangan
	var total int64

	offset := (paginate.Page - 1) * paginate.Size
	result := repo.Db.Offset(offset).Limit(paginate.Size).Where("is_open = ?", isOpen).Order("id").Preload("CadanganType").Find(&cadangan)
	repo.Db.Model(&model.Cadangan{}).Where("is_open = ?", isOpen).Count(&total)

	if result.Error != nil {
		return response, result.Error
	}

	response.Content = cadangan
	response.Total = int(total)

	return response, nil
}

func (repo *CadanganRepositoryImpl) GetTotalCadanganByTypeCount() (interface{}, error) {
	var result struct {
		TotalNew      int `gorm:"column:total_new"`
		TotalCadangan int `gorm:"column:total_cadangan"`
		TotalAduan    int `gorm:"column:total_aduan"`
		TotalLain     int `gorm:"column:total_lain"`
		TotalClosed   int `gorm:"column:total_closed"`
	}

	query := `SELECT
                SUM(CASE WHEN c.cadangan_types_id = 1 AND c.is_open = true THEN 1 ELSE 0 END) AS total_new,
                SUM(CASE WHEN c.cadangan_types_id = 2 AND c.is_open = true THEN 1 ELSE 0 END) AS total_cadangan,
                SUM(CASE WHEN c.cadangan_types_id = 3 AND c.is_open = true THEN 1 ELSE 0 END) AS total_aduan,
                SUM(CASE WHEN c.cadangan_types_id = 4 AND c.is_open = true THEN 1 ELSE 0 END) AS total_lain,
                SUM(CASE WHEN c.is_open = false THEN 1 ELSE 0 END) AS total_closed
            FROM cadangan c
            LEFT JOIN cadangan_types ct ON c.cadangan_types_id = ct.id`

	if err := repo.Db.Raw(query).Scan(&result).Error; err != nil {
		return nil, err
	}

	resultSlice := []int{result.TotalNew, result.TotalCadangan, result.TotalAduan, result.TotalLain, result.TotalClosed}

	return resultSlice, nil
}

func (repo *CadanganRepositoryImpl) Save(cadangan model.Cadangan) error {
	result := repo.Db.Save(&cadangan)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

func (repo *CadanganRepositoryImpl) Delete(id int) error {
	var count int64
	repo.Db.Model(&model.Cadangan{}).Where("id = ?", id).Count(&count)
	if count == 0 {
		return errors.New("cadangan not found")
	}

	var cadangan model.Cadangan
	result := repo.Db.Where("id = ?", id).Delete(&cadangan)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
