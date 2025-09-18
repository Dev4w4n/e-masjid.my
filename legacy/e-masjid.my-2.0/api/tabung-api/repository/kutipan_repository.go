package repository

import (
	"fmt"

	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type KutipanRepository interface {
	FindAllByTabungId(ctx *gin.Context, tabungId int64) ([]model.Kutipan, error)
	FindAllByTabungIdBetweenCreateDate(ctx *gin.Context, params model.QueryParams, paginate model.Paginate) (model.Response, error)
	FindById(ctx *gin.Context, id int64) (model.Kutipan, error)
	Upsert(ctx *gin.Context, kutipan model.Kutipan) (model.Kutipan, error)
	Delete(ctx *gin.Context, id int64) (string, error)
}

type KutipanRepositoryImpl struct {
}

func NewKutipanRepository() KutipanRepository {
	return &KutipanRepositoryImpl{}
}

// FindAllByTabungId implements KutipanRepository.
func (repo *KutipanRepositoryImpl) FindAllByTabungId(ctx *gin.Context, tabungId int64) ([]model.Kutipan, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var kutipanList []model.Kutipan
	result := db.
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
func (repo *KutipanRepositoryImpl) FindAllByTabungIdBetweenCreateDate(ctx *gin.Context, params model.QueryParams, paginate model.Paginate) (model.Response, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var response model.Response
	var kutipanList []model.Kutipan
	var total int64
	var result *gorm.DB
	offset := (paginate.Page - 1) * paginate.Size

	if paginate.Page == 0 && paginate.Size == 0 {
		result = db.
			Order("id").
			Where("tabung_id = ? AND create_date BETWEEN ? AND ?", params.TabungId, params.FromDate, params.ToDate).
			Preload("Tabung.TabungType").
			Find(&kutipanList)

	} else {
		result = db.
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

	db.Model(&model.Kutipan{}).
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
func (repo *KutipanRepositoryImpl) FindById(ctx *gin.Context, id int64) (model.Kutipan, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var kutipan model.Kutipan
	result := db.
		Preload("Tabung.TabungType").
		First(&kutipan, "id = ?", id)

	if result.Error != nil {
		return model.Kutipan{}, result.Error
	}

	sumTotal(&kutipan)

	return kutipan, nil
}

// Save implements KutipanRepository.
func (repo *KutipanRepositoryImpl) Save(ctx *gin.Context, kutipan model.Kutipan) (model.Kutipan, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Save(&kutipan)

	if result.Error != nil {
		return model.Kutipan{}, result.Error
	}

	kutipan, err := repo.FindById(ctx, kutipan.Id)

	if err != nil {
		return model.Kutipan{}, err
	}

	return kutipan, nil
}

// Save and Update implements KutipanRepository.
func (repo *KutipanRepositoryImpl) Upsert(ctx *gin.Context, kutipan model.Kutipan) (model.Kutipan, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var result *gorm.DB

	if kutipan.Id > 0 {
		result = db.Omit("tabung_id").Updates(&kutipan)
	} else {
		result = db.Save(&kutipan)
	}

	if result.Error != nil {
		return model.Kutipan{}, result.Error
	}

	_kutipan, err := repo.FindById(ctx, kutipan.Id)
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

// Remove Kutipan
func (repo *KutipanRepositoryImpl) Delete(ctx *gin.Context, id int64) (string, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Where("id = ?", id).Delete(&model.Kutipan{})

	if result.Error != nil {
		return "", result.Error
	}

	return fmt.Sprintf("Kutipan id: %d is removed", id), nil
}
