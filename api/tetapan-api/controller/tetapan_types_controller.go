package controller

import (
	"net/http"

	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	errors "github.com/Dev4w4n/e-masjid.my/api/core/error"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/repository"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type TetapanTypeController struct {
	engine                *gin.Engine
	tetapanTypeRepository repository.TetapanTypeRepository
}

func NewTetapanTypeController(engine *gin.Engine, repo repository.TetapanTypeRepository, env *env.Environment) *TetapanTypeController {
	controller := &TetapanTypeController{
		engine:                engine,
		tetapanTypeRepository: repo,
	}

	relativePath := env.DeployURL + "tetapan-types"

	controller.engine.GET(relativePath, controller.FindAllGroupNames)
	controller.engine.GET(relativePath+"/:group_name", controller.FindByGroupName)

	return controller
}

func (controller *TetapanTypeController) FindAllGroupNames(ctx *gin.Context) {
	log.Info().Msg("find all tetapan type group names")

	result, err := controller.tetapanTypeRepository.FindAllGroupNames()
	errors.InternalServerError(ctx, err, "failed to retrieve tetapan type group names")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *TetapanTypeController) FindByGroupName(ctx *gin.Context) {
	log.Info().Msg("findbygroupname tetapan type")

	groupName := ctx.Param("group_name")
	result, err := controller.tetapanTypeRepository.FindByGroupName(groupName)
	errors.InternalServerError(ctx, err, "failed to retrieve tetapan type by group name")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}
