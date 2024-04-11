package controller

import (
	"net/http"

	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	errors "github.com/Dev4w4n/e-masjid.my/api/core/error"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/repository"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type TetapanController struct {
	engine            *gin.Engine
	tetapanRepository repository.TetapanRepository
}

func NewTetapanController(engine *gin.Engine, repo repository.TetapanRepository, env *env.Environment) *TetapanController {
	controller := &TetapanController{
		engine:            engine,
		tetapanRepository: repo,
	}

	relativePath := env.DeployURL + "tetapan"

	controller.engine.GET(relativePath, controller.FindAll)
	controller.engine.GET(relativePath+"/:kunci", controller.FindByKunci)

	return controller
}

func (controller *TetapanController) FindAll(ctx *gin.Context) {
	log.Info().Msg("find all tetapan")

	result, err := controller.tetapanRepository.FindAll()
	errors.InternalServerError(ctx, err, "failed to retrieve tetapan list")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *TetapanController) FindByKunci(ctx *gin.Context) {
	log.Info().Msg("findbykunci tetapan")

	kunci := ctx.Param("kunci")
	result, err := controller.tetapanRepository.FindByKunci(kunci)
	errors.InternalServerError(ctx, err, "failed to retrieve tetapan")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}
