package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-gonic/gin"
)

type TabungTypeRepository interface {
	FindAll(ctx *gin.Context) ([]model.TabungType, error)
	Save(ctx *gin.Context, tabungType model.TabungType) error
	Delete(ctx *gin.Context, id int64) error
}

type TabungTypeRepositoryImpl struct {
}

func NewTabungTypeRepository() TabungTypeRepository {
	return &TabungTypeRepositoryImpl{}
}

// FindAll implements TabungTypeRepository.
func (repo *TabungTypeRepositoryImpl) FindAll(ctx *gin.Context) ([]model.TabungType, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var tabungTypeList []model.TabungType
	result := db.Find(&tabungTypeList)

	if result.Error != nil {
		return nil, result.Error
	}

	return tabungTypeList, nil
}

// Save implements TabungTypeRepository.
func (repo *TabungTypeRepositoryImpl) Save(ctx *gin.Context, tabungType model.TabungType) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Save(&tabungType)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// Delete implements TabungTypeRepository.
func (repo *TabungTypeRepositoryImpl) Delete(ctx *gin.Context, id int64) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var tabungType model.TabungType
	result := db.Where("id = ?", id).Delete(&tabungType)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
