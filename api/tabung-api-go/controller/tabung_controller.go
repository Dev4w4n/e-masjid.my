package controller

import (
	"net/http"
	"strconv"

	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/service"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/utils"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type TabungController struct {
	engine        *gin.Engine
	tabungService service.TabungService
}

func NewTabungController(engine *gin.Engine, svc service.TabungService, env *utils.Environment) *TabungController {
	controller := &TabungController{
		engine:        engine,
		tabungService: svc,
	}

	relativePath := env.DeployURL + "tabung"

	controller.engine.GET(relativePath, controller.FindAll)
	controller.engine.GET(relativePath+"/:id", controller.FindById)
	controller.engine.POST(relativePath, controller.Save)
	controller.engine.DELETE(relativePath+"/:id", controller.Delete)

	return controller
}

func (controller *TabungController) FindAll(ctx *gin.Context) {
	log.Info().Msg("get tabung list")

	result, err := controller.tabungService.FindAll()
	utils.InternalServerError(ctx, err, "failed to retrieve tabung list")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *TabungController) FindById(ctx *gin.Context) {
	log.Info().Msg("get tabung by id")

	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	utils.BadRequestError(ctx, err, "invalid id format")

	result, err := controller.tabungService.FindById(id)
	utils.InternalServerError(ctx, err, "failed to retrieve tabung")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *TabungController) Save(ctx *gin.Context) {
	log.Info().Msg("save tabung type")

	tabung := model.Tabung{}
	err := ctx.ShouldBindJSON(&tabung)
	utils.InternalServerError(ctx, err, "failed to bind JSON")

	tabung, err = controller.tabungService.Save(tabung)
	utils.InternalServerError(ctx, err, "failed to save tabung")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, tabung)
}

func (controller *TabungController) Delete(ctx *gin.Context) {
	log.Info().Msg("delete tabung type")

	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	utils.BadRequestError(ctx, err, "invalid id format")

	err = controller.tabungService.Delete(id)
	utils.InternalServerError(ctx, err, "failed to delete tabung")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}
