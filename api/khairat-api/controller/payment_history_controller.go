package controller

import (
	"net/http"

	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/service"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/utils"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type PaymentHistoryController struct {
	engine                *gin.Engine
	paymentHistoryService service.PaymentHistoryService
}

func NewPaymentHistoryController(engine *gin.Engine, svc service.PaymentHistoryService, env *utils.Environment) *PaymentHistoryController {
	controller := &PaymentHistoryController{
		engine:                engine,
		paymentHistoryService: svc,
	}

	relativePath := env.DeployURL + "payment"

	controller.engine.GET(relativePath+"/totalMembersPaidForCurrentYear", controller.GetTotalMembersPaidForCurrentYear)

	return controller
}

func (controller *PaymentHistoryController) GetTotalMembersPaidForCurrentYear(ctx *gin.Context) {
	log.Info().Msg("get total members paid for current year")

	result, err := controller.paymentHistoryService.FindTotalMembersPaidForCurrentYear()
	utils.WebError(ctx, err, "failed to retrieve total members paid for current year")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}
