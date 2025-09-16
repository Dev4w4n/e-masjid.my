package repository

import (
	"strings"

	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/model"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-gonic/gin"
)

type TetapanTypeRepository interface {
	FindAllGroupNames(ctx *gin.Context) (model.TetapanTypeGroupNames, error)
	FindByGroupName(ctx *gin.Context, kunci string) ([]model.TetapanType, error)
}

type TetapanTypeRepositoryImpl struct {
}

func NewTetapanTypeRepository() TetapanTypeRepository {
	return &TetapanTypeRepositoryImpl{}
}

func (repo *TetapanTypeRepositoryImpl) FindAllGroupNames(ctx *gin.Context) (model.TetapanTypeGroupNames, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var distinctValues []string

	result := db.Model(&model.TetapanType{}).Distinct("group_name").Pluck("group_name", &distinctValues)

	if result.Error != nil {
		return model.TetapanTypeGroupNames{}, result.Error
	}

	groupNames := model.TetapanTypeGroupNames{Groups: distinctValues}

	return groupNames, nil
}

func (repo *TetapanTypeRepositoryImpl) FindByGroupName(ctx *gin.Context, groupName string) ([]model.TetapanType, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var tetapanTypes []model.TetapanType

	result := db.Where("UPPER(group_name) = ?", strings.ToUpper(groupName)).Find(&tetapanTypes)

	if result.Error != nil {
		return []model.TetapanType{}, result.Error
	}

	return tetapanTypes, nil
}
