package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-public-api/model"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-gonic/gin"
)

type CadanganRepository interface {
	Save(ctx *gin.Context, cadangan model.Cadangan) error
}

type CadanganRepositoryImpl struct {
}

func NewCadanganRepository() CadanganRepository {
	return &CadanganRepositoryImpl{}
}

func (repo *CadanganRepositoryImpl) Save(ctx *gin.Context, cadangan model.Cadangan) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Save(&cadangan)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
