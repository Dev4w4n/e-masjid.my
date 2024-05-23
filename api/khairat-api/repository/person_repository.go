package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-gonic/gin"
)

type PersonRepository interface {
	FindById(ctx *gin.Context, id int64) (model.Person, error)
	Save(ctx *gin.Context, person model.Person) (model.Person, error)
	Delete(ctx *gin.Context, id int64) error
}

type PersonRepositoryImpl struct {
}

func NewPersonRepository() PersonRepository {
	return &PersonRepositoryImpl{}
}

// Delete implements PersonRepository.
func (repo *PersonRepositoryImpl) Delete(ctx *gin.Context, id int64) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Where("id = ?", id).Delete(&model.Person{})

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// FindById implements PersonRepository.
func (repo *PersonRepositoryImpl) FindById(ctx *gin.Context, id int64) (model.Person, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var person model.Person

	result := db.Where("id = ?", id).Find(&person)

	if result.Error != nil {
		return model.Person{}, result.Error
	}

	return person, nil
}

// Save implements PersonRepository.
func (repo *PersonRepositoryImpl) Save(ctx *gin.Context, person model.Person) (model.Person, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Save(&person)

	if result.Error != nil {
		return model.Person{}, result.Error
	}

	return person, nil
}
