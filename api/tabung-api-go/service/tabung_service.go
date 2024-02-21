package service

import (
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/repository"
)

type TabungService interface {
	FindAll() ([]model.Tabung, error)
	FindById(id int64) (model.Tabung, error)
	Save(tabung model.Tabung) error
	Delete(id int64) error
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
func (service *TabungServiceImpl) FindAll() ([]model.Tabung, error) {
	return service.tabungRepository.FindAll()
}

// FindById implements TabungService.
func (service *TabungServiceImpl) FindById(id int64) (model.Tabung, error) {
	return service.tabungRepository.FindById(id)
}

// Save implements TabungService.
func (service *TabungServiceImpl) Save(tabung model.Tabung) error {
	return service.tabungRepository.Save(tabung)
}

// Delete implements TabungService.
func (service *TabungServiceImpl) Delete(id int64) error {
	return service.tabungRepository.Delete(id)
}
