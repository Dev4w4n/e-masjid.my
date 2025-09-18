package service

import (
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/repository"
	"github.com/gin-gonic/gin"
)

type TabungService interface {
	FindAll(ctx *gin.Context) ([]model.Tabung, error)
	FindById(ctx *gin.Context, id int64) (model.Tabung, error)
	Save(ctx *gin.Context, tabung model.Tabung) (model.Tabung, error)
	Delete(ctx *gin.Context, id int64) error
}

type TabungServiceImpl struct {
	tabungRepository repository.TabungRepository
}

func NewTabungService(tabungRepository repository.TabungRepository) TabungService {
	return &TabungServiceImpl{
		tabungRepository: tabungRepository,
	}
}

// FindAll implements TabungService.
func (service *TabungServiceImpl) FindAll(ctx *gin.Context) ([]model.Tabung, error) {
	return service.tabungRepository.FindAll(ctx)
}

// FindById implements TabungService.
func (service *TabungServiceImpl) FindById(ctx *gin.Context, id int64) (model.Tabung, error) {
	return service.tabungRepository.FindById(ctx, id)
}

// Save implements TabungService.
func (service *TabungServiceImpl) Save(ctx *gin.Context, tabung model.Tabung) (model.Tabung, error) {
	return service.tabungRepository.Save(ctx, tabung)
}

// Delete implements TabungService.
func (service *TabungServiceImpl) Delete(ctx *gin.Context, id int64) error {
	return service.tabungRepository.Delete(ctx, id)
}
