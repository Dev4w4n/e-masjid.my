package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-gonic/gin"
)

type TagRepository interface {
	FindAll(ctx *gin.Context) (model.Response, error)
	Save(ctx *gin.Context, tag model.Tag) error
	Delete(ctx *gin.Context, id int) error
}

type TagRepositoryImpl struct {
}

func NewTagRepository() TagRepository {
	return &TagRepositoryImpl{}
}

// Delete implements TagRepository.
func (repo *TagRepositoryImpl) Delete(ctx *gin.Context, id int) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var tag model.Tag
	result := db.Where("id = ?", id).Delete(&tag)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// FindAll implements TagRepository.
func (repo *TagRepositoryImpl) FindAll(ctx *gin.Context) (model.Response, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var tagList []model.Tag
	var response model.Response

	result := db.Find(&tagList)

	if result.Error != nil {
		return response, result.Error
	}

	response.Content = tagList

	return response, nil
}

// Save implements TagRepository.
func (repo *TagRepositoryImpl) Save(ctx *gin.Context, tag model.Tag) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Save(&tag)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
