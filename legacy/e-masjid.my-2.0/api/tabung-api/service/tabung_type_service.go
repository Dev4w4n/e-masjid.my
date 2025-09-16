package service

import (
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/repository"
	"github.com/gin-gonic/gin"
)

type TabungTypeService interface {
	FindAll(ctx *gin.Context) ([]model.TabungType, error)
	Save(ctx *gin.Context, tabungType model.TabungType) error
	Delete(ctx *gin.Context, id int64) error
}

type TabungTypeServiceImpl struct {
	tabungTypeRepository repository.TabungTypeRepository
}

func NewTabungTypeService(tabungTypeRepository repository.TabungTypeRepository) TabungTypeService {
	return &TabungTypeServiceImpl{
		tabungTypeRepository: tabungTypeRepository,
	}
}

// FindAll implements TabungTypeService.
func (service *TabungTypeServiceImpl) FindAll(ctx *gin.Context) ([]model.TabungType, error) {
	return service.tabungTypeRepository.FindAll(ctx)
}

// Save implements TabungTypeService.
func (service *TabungTypeServiceImpl) Save(ctx *gin.Context, tabungType model.TabungType) error {
	return service.tabungTypeRepository.Save(ctx, tabungType)
}

// Delete implements TabungTypeService.
func (service *TabungTypeServiceImpl) Delete(ctx *gin.Context, id int64) error {
	return service.tabungTypeRepository.Delete(ctx, id)
}
