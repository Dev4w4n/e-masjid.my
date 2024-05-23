package controller

import (
	"net/http"

	errors "github.com/Dev4w4n/e-masjid.my/api/core/error"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/repository"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type TetapanController struct {
	tetapanRepository repository.TetapanRepository
}

func NewTetapanController(repo repository.TetapanRepository) *TetapanController {
	return &TetapanController{
		tetapanRepository: repo,
	}
}

// FindAll		godoc
//
//	@Summary		find all tetapan
//	@Description	Return the all tetapan.
//	@Produce		application/json
//	@Tags			tetapan
//	@Success		200	{array}	model.Tetapan
//	@Router			/tetapan [get]
func (controller *TetapanController) FindAll(ctx *gin.Context) {
	log.Info().Msg("find all tetapan")

	result, err := controller.tetapanRepository.FindAll(ctx)
	errors.InternalServerError(ctx, err, "failed to retrieve tetapan list")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// FindByKunci		godoc
//
//	@Summary		find tetapan by kunci
//	@Description	Return the  tetapan by kunci
//	@Produce		application/json
//	@Param			kunci	path	string	true	"kunci"
//	@Tags			tetapan
//	@Success		200	{object}	model.Tetapan
//	@Router			/tetapan/{kunci} [get]
func (controller *TetapanController) FindByKunci(ctx *gin.Context) {
	log.Info().Msg("findbykunci tetapan")

	kunci := ctx.Param("kunci")
	result, err := controller.tetapanRepository.FindByKunci(ctx, kunci)
	errors.InternalServerError(ctx, err, "failed to retrieve tetapan")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}
