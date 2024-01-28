package repository

import (
	"time"

	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"gorm.io/gorm"
)

type PaymentHistoryRepository interface {
	Save(paymentHistory model.PaymentHistory) error
	FindByMemberIdAndPaymentDateGreaterThan(memberId int, paymentDate int64) ([]model.PaymentHistory, error)
	FindPaymentHistoryByMemberIdAndCurrentYear(memberId int) (model.PaymentHistory, error)
	GetTotalMembersPaidForCurrentYear() (int, error)
}

type PaymentHistoryRepositoryImpl struct {
	Db *gorm.DB
}

func NewPaymentHistoryRepository(db *gorm.DB) PaymentHistoryRepository {
	db.AutoMigrate(&model.PaymentHistory{})

	return &PaymentHistoryRepositoryImpl{Db: db}
}

// FindByMemberIdAndPaymentDateGreaterThan implements PaymentHistoryRepository.
func (repo *PaymentHistoryRepositoryImpl) FindByMemberIdAndPaymentDateGreaterThan(memberId int, paymentDate int64) ([]model.PaymentHistory, error) {
	var paymentHistory []model.PaymentHistory

	result := repo.Db.Where("member_id = ? AND payment_date > ?", memberId, paymentDate).Preload("Member").Find(&paymentHistory)

	if result.Error != nil {
		return nil, result.Error
	}

	return paymentHistory, nil
}

// FindPaymentHistoryByMemberIdAndCurrentYear implements PaymentHistoryRepository.
func (repo *PaymentHistoryRepositoryImpl) FindPaymentHistoryByMemberIdAndCurrentYear(memberId int) (model.PaymentHistory, error) {
	var paymentHistory model.PaymentHistory

	currentYearEpochTime := time.Now().AddDate(time.Now().Year(), 1, 1).Unix() / 1000

	result := repo.Db.Where("member_id = ? AND payment_date > ?", memberId, currentYearEpochTime).Preload("Member").Find(&paymentHistory)

	if result.Error != nil {
		return model.PaymentHistory{}, result.Error
	}

	return paymentHistory, nil
}

// GetTotalMembersPaidForCurrentYear implements PaymentHistoryRepository.
func (repo *PaymentHistoryRepositoryImpl) GetTotalMembersPaidForCurrentYear() (int, error) {
	query := `SELECT COUNT(DISTINCT member_id) AS total_members_paid
	FROM khairat_payment_history
	WHERE 
	EXTRACT(YEAR FROM DATE_TRUNC('year', to_timestamp(payment_date/1000))) = EXTRACT(YEAR FROM CURRENT_DATE)`

	var totalMembersPaid int

	if err := repo.Db.Raw(query).Scan(&totalMembersPaid).Error; err != nil {
		return 0, err
	}

	return totalMembersPaid, nil
}

// Save implements PaymentHistoryRepository.
func (repo *PaymentHistoryRepositoryImpl) Save(paymentHistory model.PaymentHistory) error {
	result := repo.Db.Save(&paymentHistory)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
