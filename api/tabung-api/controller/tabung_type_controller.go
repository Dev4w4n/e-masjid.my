package controller

import (
	"net/http"
	"strconv"

	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	errors "github.com/Dev4w4n/e-masjid.my/api/core/error"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/service"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type TabungTypeController struct {
	engine            *gin.Engine
	tabungTypeService service.TabungTypeService
}

func NewTabungTypeController(engine *gin.Engine, svc service.TabungTypeService, env *env.Environment) *TabungTypeController {
	controller := &TabungTypeController{
		engine:            engine,
		tabungTypeService: svc,
	}

	relativePath := env.DeployURL + "tabung-types"

	controller.engine.GET(relativePath, controller.FindAll)
	controller.engine.POST(relativePath, controller.Save)
	controller.engine.DELETE(relativePath+"/:id", controller.Delete)

	return controller
}

func (controller *TabungTypeController) FindAll(ctx *gin.Context) {
	log.Info().Msg("get tabung types")

	result, err := controller.tabungTypeService.FindAll()
	errors.InternalServerError(ctx, err, "failed to retrieve tabung types")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *TabungTypeController) Save(ctx *gin.Context) {
	log.Info().Msg("save tabung type")

	tabungType := model.TabungType{}
	err := ctx.ShouldBindJSON(&tabungType)
	errors.InternalServerError(ctx, err, "failed to bind JSON")

	err = controller.tabungTypeService.Save(tabungType)
	errors.InternalServerError(ctx, err, "failed to save tabung type")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}

func (controller *TabungTypeController) Delete(ctx *gin.Context) {
	log.Info().Msg("delete tabung type")

	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	errors.BadRequestError(ctx, err, "invalid id format")

	err = controller.tabungTypeService.Delete(id)
	errors.InternalServerError(ctx, err, "failed to delete tabung type")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}
