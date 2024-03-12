package service

import (
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/repository"
)

type TabungTypeService interface {
	FindAll() ([]model.TabungType, error)
	Save(tabungType model.TabungType) error
	Delete(id int64) error
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
func (service *TabungTypeServiceImpl) FindAll() ([]model.TabungType, error) {
	return service.tabungTypeRepository.FindAll()
}

// Save implements TabungTypeService.
func (service *TabungTypeServiceImpl) Save(tabungType model.TabungType) error {
	return service.tabungTypeRepository.Save(tabungType)
}

// Delete implements TabungTypeService.
func (service *TabungTypeServiceImpl) Delete(id int64) error {
	return service.tabungTypeRepository.Delete(id)
}
