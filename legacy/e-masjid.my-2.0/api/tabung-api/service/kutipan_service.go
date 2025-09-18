package service

import (
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/repository"
	"github.com/gin-gonic/gin"
)

type KutipanService interface {
	FindAllByTabungId(ctx *gin.Context, id int64) ([]model.Kutipan, error)
	FindAllByTabungIdBetweenCreateDate(ctx *gin.Context, params model.QueryParams, paginate model.Paginate) (model.Response, error)
	FindById(ctx *gin.Context, id int64) (model.Kutipan, error)
	Upsert(ctx *gin.Context, kutipan model.Kutipan) (model.Kutipan, error)
	Delete(ctx *gin.Context, id int64) (string, error)
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
func (service *KutipanServiceImpl) FindAllByTabungId(ctx *gin.Context, tabungId int64) ([]model.Kutipan, error) {
	return service.kutipanRepository.FindAllByTabungId(ctx, tabungId)
}

// FindAllByTabungIdBetweenCreateDate implements KutipanService.
func (service *KutipanServiceImpl) FindAllByTabungIdBetweenCreateDate(ctx *gin.Context, params model.QueryParams, paginate model.Paginate) (model.Response, error) {
	return service.kutipanRepository.FindAllByTabungIdBetweenCreateDate(ctx, params, paginate)
}

// FindById implements KutipanService.
func (service *KutipanServiceImpl) FindById(ctx *gin.Context, id int64) (model.Kutipan, error) {
	return service.kutipanRepository.FindById(ctx, id)
}

// Save implements KutipanService.
func (service *KutipanServiceImpl) Upsert(ctx *gin.Context, kutipan model.Kutipan) (model.Kutipan, error) {
	return service.kutipanRepository.Upsert(ctx, kutipan)
}

func (service *KutipanServiceImpl) Delete(ctx *gin.Context, id int64) (string, error) {
	return service.kutipanRepository.Delete(ctx, id)
}
