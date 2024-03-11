package service

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/repository"
)

type PaymentHistoryService interface {
	Save(paymentHistory model.PaymentHistory) error
	FindTotalMembersPaidForCurrentYear() (int64, error)
	IsCurrentYearPaymentExist(memberId int64) (bool, error)
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
func (repo *PaymentHistoryServiceImpl) FindTotalMembersPaidForCurrentYear() (int64, error) {
	result, err := repo.paymentHistoryRepository.GetTotalMembersPaidForCurrentYear()

	if err != nil {
		return 0, err
	}

	return result, nil
}

// IsCurrentYearPaymentExist implements PaymentHistoryService.
func (repo *PaymentHistoryServiceImpl) IsCurrentYearPaymentExist(memberId int64) (bool, error) {
	result, err := repo.paymentHistoryRepository.FindPaymentHistoryByMemberIdAndCurrentYear(memberId)

	if err != nil {
		return false, err
	}

	return result.Id > 0, nil
}

// Save implements PaymentHistoryService.
func (repo *PaymentHistoryServiceImpl) Save(paymentHistory model.PaymentHistory) error {
	paymentHistory, err := repo.paymentHistoryRepository.FindPaymentHistoryByMemberIdAndCurrentYear(paymentHistory.MemberId)

	if err != nil {
		return err
	}

	err = repo.paymentHistoryRepository.Delete(paymentHistory)

	if err != nil {
		return err
	}

	return repo.paymentHistoryRepository.Save(paymentHistory)
}
