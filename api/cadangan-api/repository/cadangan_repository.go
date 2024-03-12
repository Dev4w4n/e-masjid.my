package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/model"
	"gorm.io/gorm"
)

type CadanganRepository interface {
	GetOne(id int) (model.Cadangan, error)
	GetCadanganById(id int, isOpen bool) (model.Response, error)
	GetCadanganByIsOpen(isOpen bool) (model.Response, error)
	GetTotalCadanganByTypeCount() (interface{}, error)
	Save(cadangan model.Cadangan) error
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

func (repo *CadanganRepositoryImpl) GetCadanganById(id int, isOpen bool) (model.Response, error) {
	var response model.Response
	var cadangan []model.Cadangan

	result := repo.Db.Where("cadangan_types_id = ? AND is_open = ?", id, isOpen).Preload("CadanganType").Find(&cadangan)

	if result.Error != nil {
		return response, result.Error
	}

	response.Content = cadangan

	return response, nil
}

func (repo *CadanganRepositoryImpl) GetCadanganByIsOpen(isOpen bool) (model.Response, error) {
	var response model.Response
	var cadangan []model.Cadangan

	result := repo.Db.Where("is_open = ?", isOpen).Preload("CadanganType").Find(&cadangan)

	if result.Error != nil {
		return response, result.Error
	}

	response.Content = cadangan

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
