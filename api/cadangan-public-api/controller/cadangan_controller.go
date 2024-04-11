package controller

import (
	"net/http"

	"github.com/Dev4w4n/e-masjid.my/api/cadangan-public-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-public-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	errors "github.com/Dev4w4n/e-masjid.my/api/core/error"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type CadanganController struct {
	engine             *gin.Engine
	cadanganRepository repository.CadanganRepository
}

func NewCadanganController(engine *gin.Engine, repo repository.CadanganRepository, env *env.Environment) *CadanganController {
	controller := &CadanganController{
		engine:             engine,
		cadanganRepository: repo,
	}

	controller.engine.POST(env.DeployURL+"cadangan", controller.Save)

	return controller
}

func (controller *CadanganController) Save(ctx *gin.Context) {
	log.Info().Msg("save cadangan")

	saveCadangan := model.Cadangan{}
	err := ctx.ShouldBindJSON(&saveCadangan)
	errors.BadRequestError(ctx, err, "failed to bind JSON")

	err = controller.cadanganRepository.Save(saveCadangan)
	errors.InternalServerError(ctx, err, "failed to save cadangan")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}
