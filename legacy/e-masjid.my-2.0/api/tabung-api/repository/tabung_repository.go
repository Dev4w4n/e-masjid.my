package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-gonic/gin"
)

type TabungRepository interface {
	FindAll(ctx *gin.Context) ([]model.Tabung, error)
	FindById(ctx *gin.Context, id int64) (model.Tabung, error)
	Save(ctx *gin.Context, tabung model.Tabung) (model.Tabung, error)
	Delete(ctx *gin.Context, id int64) error
}

type TabungRepositoryImpl struct {
}

func NewTabungRepository() TabungRepository {
	return &TabungRepositoryImpl{}
}

// FindAll implements TabungRepository.
func (repo *TabungRepositoryImpl) FindAll(ctx *gin.Context) ([]model.Tabung, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var tabungList []model.Tabung
	result := db.
		Preload("TabungType").
		Find(&tabungList)

	if result.Error != nil {
		return nil, result.Error
	}

	return tabungList, nil
}

// FindById implements TabungRepository.
func (repo *TabungRepositoryImpl) FindById(ctx *gin.Context, id int64) (model.Tabung, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var tabung model.Tabung
	result := db.
		Preload("TabungType").
		First(&tabung, "id = ?", id)

	if result.Error != nil {
		return model.Tabung{}, result.Error
	}

	return tabung, nil
}

// Save implements TabungRepository.
func (repo *TabungRepositoryImpl) Save(ctx *gin.Context, tabung model.Tabung) (model.Tabung, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Save(&tabung)

	if result.Error != nil {
		return model.Tabung{}, result.Error
	}

	tabung, err := repo.FindById(ctx, tabung.Id)

	if err != nil {
		return model.Tabung{}, err
	}

	return tabung, nil
}

// Delete implements TabungRepository.
func (repo *TabungRepositoryImpl) Delete(ctx *gin.Context, id int64) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var tabung model.Tabung
	result := db.Where("id = ?", id).Delete(&tabung)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
