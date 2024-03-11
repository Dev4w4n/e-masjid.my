package service

import (
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/repository"
)

type KutipanService interface {
	FindAllByTabungId(id int64) ([]model.Kutipan, error)
	FindAllByTabungIdBetweenCreateDate(id int64, fromDate int64, toDate int64) ([]model.Kutipan, error)
	FindById(id int64) (model.Kutipan, error)
	Save(kutipan model.Kutipan) (model.Kutipan, error)
}

type KutipanServiceImpl struct {
	kutipanRepository repository.KutipanRepository
}

func NewKutipanService(kutipanRepository repository.KutipanRepository) KutipanService {
	return &KutipanServiceImpl{
		kutipanRepository: kutipanRepository,
	}
}

// FindAllByTabungId implements KutipanService.
func (service *KutipanServiceImpl) FindAllByTabungId(tabungId int64) ([]model.Kutipan, error) {
	return service.kutipanRepository.FindAllByTabungId(tabungId)
}

// FindAllByTabungIdBetweenCreateDate implements KutipanService.
func (service *KutipanServiceImpl) FindAllByTabungIdBetweenCreateDate(tabungId int64, fromDate int64, toDate int64) ([]model.Kutipan, error) {
	return service.kutipanRepository.FindAllByTabungIdBetweenCreateDate(tabungId, fromDate, toDate)
}

// FindById implements KutipanService.
func (service *KutipanServiceImpl) FindById(id int64) (model.Kutipan, error) {
	return service.kutipanRepository.FindById(id)
}

// Save implements KutipanService.
func (service *KutipanServiceImpl) Save(kutipan model.Kutipan) (model.Kutipan, error) {
	return service.kutipanRepository.Save(kutipan)
}
