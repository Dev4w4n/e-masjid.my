package repository

import (
	"errors"

	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/model"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-gonic/gin"
)

type CadanganRepository interface {
	GetOne(ctx *gin.Context, id int) (model.Cadangan, error)
	GetCadanganById(ctx *gin.Context, id int, isOpen bool, paginate model.Paginate) (model.Response, error)
	GetCadanganByIsOpen(ctx *gin.Context, isOpen bool, paginate model.Paginate) (model.Response, error)
	GetTotalCadanganByTypeCount(ctx *gin.Context) (interface{}, error)
	Save(ctx *gin.Context, cadangan model.Cadangan) error
	Delete(ctx *gin.Context, id int) error
}

type CadanganRepositoryImpl struct {
}

func NewCadanganRepository() CadanganRepository {
	return &CadanganRepositoryImpl{}
}

func (repo *CadanganRepositoryImpl) GetOne(ctx *gin.Context, id int) (model.Cadangan, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var cadangan model.Cadangan

	result := db.Where("id = ?", id).Preload("CadanganType").First(&cadangan)

	if result.Error != nil {
		return model.Cadangan{}, result.Error
	}

	return cadangan, nil
}

func (repo *CadanganRepositoryImpl) GetCadanganById(ctx *gin.Context, id int, isOpen bool, paginate model.Paginate) (model.Response, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var response model.Response
	var cadangan []model.Cadangan
	var total int64

	offset := (paginate.Page - 1) * paginate.Size
	result := db.Offset(offset).Limit(paginate.Size).Where("cadangan_types_id = ? AND is_open = ?", id, isOpen).Order("id").Preload("CadanganType").Find(&cadangan)
	db.Model(&model.Cadangan{}).Where("cadangan_types_id = ? AND is_open = ?", id, isOpen).Count(&total)

	if result.Error != nil {
		return response, result.Error
	}

	response.Content = cadangan
	response.Total = int(total)

	return response, nil
}

func (repo *CadanganRepositoryImpl) GetCadanganByIsOpen(ctx *gin.Context, isOpen bool, paginate model.Paginate) (model.Response, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var response model.Response
	var cadangan []model.Cadangan
	var total int64

	offset := (paginate.Page - 1) * paginate.Size
	result := db.Offset(offset).Limit(paginate.Size).Where("is_open = ?", isOpen).Order("id").Preload("CadanganType").Find(&cadangan)
	db.Model(&model.Cadangan{}).Where("is_open = ?", isOpen).Count(&total)

	if result.Error != nil {
		return response, result.Error
	}

	response.Content = cadangan
	response.Total = int(total)

	return response, nil
}

func (repo *CadanganRepositoryImpl) GetTotalCadanganByTypeCount(ctx *gin.Context) (interface{}, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
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

	if err := db.Raw(query).Scan(&result).Error; err != nil {
		return nil, err
	}

	resultSlice := []int{result.TotalNew, result.TotalCadangan, result.TotalAduan, result.TotalLain, result.TotalClosed}

	return resultSlice, nil
}

func (repo *CadanganRepositoryImpl) Save(ctx *gin.Context, cadangan model.Cadangan) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Save(&cadangan)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

func (repo *CadanganRepositoryImpl) Delete(ctx *gin.Context, id int) error {
	var count int64
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	db.Model(&model.Cadangan{}).Where("id = ?", id).Count(&count)
	if count == 0 {
		return errors.New("cadangan not found")
	}

	var cadangan model.Cadangan
	result := db.Where("id = ?", id).Delete(&cadangan)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
