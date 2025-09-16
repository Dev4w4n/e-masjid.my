package controller

import (
	"net/http"

	errors "github.com/Dev4w4n/e-masjid.my/api/core/error"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/service"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type PaymentHistoryController struct {
	paymentHistoryService service.PaymentHistoryService
}

func NewPaymentHistoryController(svc service.PaymentHistoryService) *PaymentHistoryController {
	return &PaymentHistoryController{
		paymentHistoryService: svc,
	}
}

// GetTotalMembersPaidForCurrentYear		godoc
//
//	@Summary		get total members paid for current year
//	@Description	get total members paid for current year
//	@Produce		application/json
//	@Tags			payment
//	@Router			/payment/report/total-members-paid-current-year [get]
func (controller *PaymentHistoryController) GetTotalMembersPaidForCurrentYear(ctx *gin.Context) {
	log.Info().Msg("get total members paid for current year")

	result, err := controller.paymentHistoryService.FindTotalMembersPaidForCurrentYear(ctx)
	errors.InternalServerError(ctx, err, "failed to retrieve total members paid for current year")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}
