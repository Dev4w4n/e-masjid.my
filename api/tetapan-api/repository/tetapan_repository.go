package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/model"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-gonic/gin"
)

type TetapanRepository interface {
	FindAll(ctx *gin.Context) ([]model.Tetapan, error)
	FindByKunci(ctx *gin.Context, kunci string) (model.Tetapan, error)
	Save(ctx *gin.Context, tetapan model.Tetapan) error
	SaveAll(ctx *gin.Context, tetapanList []model.Tetapan) error
	Delete(ctx *gin.Context, kunci string) error
}

type TetapanRepositoryImpl struct {
}

func NewTetapanRepository() TetapanRepository {
	return &TetapanRepositoryImpl{}
}

func (repo *TetapanRepositoryImpl) FindAll(ctx *gin.Context) ([]model.Tetapan, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var tetapanList []model.Tetapan
	result := db.Find(&tetapanList)

	if result.Error != nil {
		return nil, result.Error
	}

	return tetapanList, nil
}

func (repo *TetapanRepositoryImpl) FindByKunci(ctx *gin.Context, kunci string) (model.Tetapan, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var tetapan model.Tetapan
	result := db.First(&tetapan, "kunci = ?", kunci)

	if result.Error != nil {
		return model.Tetapan{}, result.Error
	}

	return tetapan, nil
}

func (repo *TetapanRepositoryImpl) Save(ctx *gin.Context, tetapan model.Tetapan) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Save(tetapan)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

func (repo *TetapanRepositoryImpl) SaveAll(ctx *gin.Context, tetapanList []model.Tetapan) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Save(tetapanList)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

func (repo *TetapanRepositoryImpl) Delete(ctx *gin.Context, kunci string) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var tetapan model.Tetapan
	result := db.Where("kunci = ?", kunci).Delete(&tetapan)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
