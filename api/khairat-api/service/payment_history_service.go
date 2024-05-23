package service

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/repository"
	"github.com/gin-gonic/gin"
)

type PaymentHistoryService interface {
	Save(ctx *gin.Context, paymentHistory model.PaymentHistory) error
	FindTotalMembersPaidForCurrentYear(ctx *gin.Context) (int64, error)
	IsCurrentYearPaymentExist(ctx *gin.Context, memberId int64) (bool, error)
}

type PaymentHistoryServiceImpl struct {
	paymentHistoryRepository repository.PaymentHistoryRepository
}

func NewPaymentHistoryService(paymentHistoryRepository repository.PaymentHistoryRepository) PaymentHistoryService {
	return &PaymentHistoryServiceImpl{
		paymentHistoryRepository: paymentHistoryRepository,
	}
}

// FindTotalMembersPaidForCurrentYear implements PaymentHistoryService.
func (repo *PaymentHistoryServiceImpl) FindTotalMembersPaidForCurrentYear(ctx *gin.Context) (int64, error) {
	result, err := repo.paymentHistoryRepository.GetTotalMembersPaidForCurrentYear(ctx)

	if err != nil {
		return 0, err
	}

	return result, nil
}

// IsCurrentYearPaymentExist implements PaymentHistoryService.
func (repo *PaymentHistoryServiceImpl) IsCurrentYearPaymentExist(ctx *gin.Context, memberId int64) (bool, error) {
	result, err := repo.paymentHistoryRepository.FindPaymentHistoryByMemberIdAndCurrentYear(ctx, memberId)

	if err != nil {
		return false, err
	}

	return result.Id > 0, nil
}

// Save implements PaymentHistoryService.
func (repo *PaymentHistoryServiceImpl) Save(ctx *gin.Context, paymentHistory model.PaymentHistory) error {
	paymentHistory, err := repo.paymentHistoryRepository.FindPaymentHistoryByMemberIdAndCurrentYear(ctx, paymentHistory.MemberId)

	if err != nil {
		return err
	}

	err = repo.paymentHistoryRepository.Delete(ctx, paymentHistory)

	if err != nil {
		return err
	}

	return repo.paymentHistoryRepository.Save(ctx, paymentHistory)
}
