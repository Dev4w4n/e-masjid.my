package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-gonic/gin"
)

type DependentRepository interface {
	Save(ctx *gin.Context, dependent model.Dependent, memberId int64) error
	Delete(ctx *gin.Context, dependent model.Dependent) error
	DeleteById(ctx *gin.Context, id int) error
	FindById(ctx *gin.Context, id int) (model.Dependent, error)
	FindAllByMemberId(ctx *gin.Context, memberId int) ([]model.Dependent, error)
}

type DependentRepositoryImpl struct {
}

func NewDependentRepository() DependentRepository {
	return &DependentRepositoryImpl{}
}

// DeleteByMemberId implements DependentRepository.
func (repo *DependentRepositoryImpl) Delete(ctx *gin.Context, dependent model.Dependent) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Delete(&dependent)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// DeleteById implements DependentRepository.
func (repo *DependentRepositoryImpl) DeleteById(ctx *gin.Context, id int) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Delete(&model.Dependent{}, id)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// FindAllByMemberId implements DependentRepository.
func (repo *DependentRepositoryImpl) FindById(ctx *gin.Context, id int) (model.Dependent, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var dependent model.Dependent

	result := db.Where("id = ?", id).Find(&dependent)

	if result.Error != nil {
		return dependent, result.Error
	}

	return dependent, nil
}

// Save implements DependentRepository.
func (repo *DependentRepositoryImpl) Save(ctx *gin.Context, dependent model.Dependent, memberId int64) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	dependent.MemberId = memberId
	result := db.Save(&dependent)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// FindAllByMemberId implements DependentRepository.
func (repo *DependentRepositoryImpl) FindAllByMemberId(ctx *gin.Context, memberId int) ([]model.Dependent, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var dependents []model.Dependent

	result := db.
		Where("member_id = ?", memberId).
		Preload("Person").
		Find(&dependents)

	if result.Error != nil {
		return dependents, result.Error
	}

	return dependents, nil
}
