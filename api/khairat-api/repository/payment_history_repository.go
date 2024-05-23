package repository

import (
	"time"

	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-gonic/gin"
)

type PaymentHistoryRepository interface {
	Save(ctx *gin.Context, paymentHistory model.PaymentHistory) error
	FindByMemberIdAndPaymentDateGreaterThan(ctx *gin.Context, memberId int64, paymentDate int64) ([]model.PaymentHistory, error)
	FindPaymentHistoryByMemberIdAndCurrentYear(ctx *gin.Context, memberId int64) (model.PaymentHistory, error)
	GetTotalMembersPaidForCurrentYear(ctx *gin.Context) (int64, error)
	Delete(ctx *gin.Context, paymentHistory model.PaymentHistory) error
	UpdatePaymentHistory(ctx *gin.Context, paymentHistories []model.PaymentHistory, memberId int64) error
}

type PaymentHistoryRepositoryImpl struct {
}

func NewPaymentHistoryRepository() PaymentHistoryRepository {
	return &PaymentHistoryRepositoryImpl{}
}

// FindByMemberIdAndPaymentDateGreaterThan implements PaymentHistoryRepository.
func (repo *PaymentHistoryRepositoryImpl) FindByMemberIdAndPaymentDateGreaterThan(ctx *gin.Context, memberId int64, paymentDate int64) ([]model.PaymentHistory, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var paymentHistory []model.PaymentHistory

	result := db.Where("member_id = ? AND payment_date > ?", memberId, paymentDate).Preload("Member").Find(&paymentHistory)

	if result.Error != nil {
		return nil, result.Error
	}

	return paymentHistory, nil
}

// FindPaymentHistoryByMemberIdAndCurrentYear implements PaymentHistoryRepository.
func (repo *PaymentHistoryRepositoryImpl) FindPaymentHistoryByMemberIdAndCurrentYear(ctx *gin.Context, memberId int64) (model.PaymentHistory, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var paymentHistory model.PaymentHistory

	currentYearEpochTime := time.Now().AddDate(time.Now().Year(), 1, 1).Unix() / 1000

	result := db.Where("member_id = ? AND payment_date > ?", memberId, currentYearEpochTime).Preload("Member").Find(&paymentHistory)

	if result.Error != nil {
		return model.PaymentHistory{}, result.Error
	}

	return paymentHistory, nil
}

// GetTotalMembersPaidForCurrentYear implements PaymentHistoryRepository.
func (repo *PaymentHistoryRepositoryImpl) GetTotalMembersPaidForCurrentYear(ctx *gin.Context) (int64, error) {
	query := `SELECT COUNT(DISTINCT member_id) AS total_members_paid
	FROM khairat_payment_history
	WHERE 
	EXTRACT(YEAR FROM DATE_TRUNC('year', to_timestamp(payment_date/1000))) = EXTRACT(YEAR FROM CURRENT_DATE)`

	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var totalMembersPaid int64

	if err := db.Raw(query).Scan(&totalMembersPaid).Error; err != nil {
		return 0, err
	}

	return totalMembersPaid, nil
}

// Save implements PaymentHistoryRepository.
func (repo *PaymentHistoryRepositoryImpl) Save(ctx *gin.Context, paymentHistory model.PaymentHistory) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Save(&paymentHistory)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// Delete implements PaymentHistoryRepository.
func (repo *PaymentHistoryRepositoryImpl) Delete(ctx *gin.Context, paymentHistory model.PaymentHistory) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Delete(&paymentHistory)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// UpdatePaymentHistory implements PaymentHistoryRepository.
func (repo *PaymentHistoryRepositoryImpl) UpdatePaymentHistory(ctx *gin.Context, paymentHistories []model.PaymentHistory, memberId int64) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	if paymentHistories == nil {
		// Delete current year payment history
		err := deleteCurrentYearPaymentByMemberId(repo, ctx, memberId)

		if err != nil {
			return err
		}
	} else {
		err := deleteCurrentYearPaymentByMemberId(repo, ctx, memberId)

		if err != nil {
			return err
		}

		for _, paymentHistory := range paymentHistories {
			if paymentHistory.Id == 0 {
				paymentHistory.MemberId = memberId
				db.Save(paymentHistory)
				break
			}
		}
	}
	return nil
}

func deleteCurrentYearPaymentByMemberId(repo *PaymentHistoryRepositoryImpl, ctx *gin.Context, memberId int64) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	paymentHistory, err := repo.FindPaymentHistoryByMemberIdAndCurrentYear(ctx, memberId)

	if err != nil {
		return err
	}

	result := db.
		Where("id = ?", paymentHistory.Id).
		Delete(&paymentHistory)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
