package controller

import (
	"net/http"

	errors "github.com/Dev4w4n/e-masjid.my/api/core/error"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/repository"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type TetapanTypeController struct {
	tetapanTypeRepository repository.TetapanTypeRepository
}

func NewTetapanTypeController(repo repository.TetapanTypeRepository) *TetapanTypeController {
	return &TetapanTypeController{
		tetapanTypeRepository: repo,
	}
}

// FindAllGroupNames		godoc
//	@Summary		find all tetapan type group names
//	@Description	Return  all tetapan type group names
//	@Produce		application/json
//	@Tags			tetapan-types
//	@Success		200	{object}	model.TetapanTypeGroupNames
//	@Router			/tetapan-types [get]
func (controller *TetapanTypeController) FindAllGroupNames(ctx *gin.Context) {
	log.Info().Msg("find all tetapan type group names")

	result, err := controller.tetapanTypeRepository.FindAllGroupNames()
	errors.InternalServerError(ctx, err, "failed to retrieve tetapan type group names")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// FindByGroupName		godoc
//	@Summary		find groupname by tetapan type
//	@Description	Return groupname by tetapan type.
//	@Produce		application/json
//	@Param			group_name	path	string	true	"get tetapan by group_name"
//	@Tags			tetapan-types
//	@Success		200	{array}	model.TetapanType
//	@Router			/tetapan-types/:group_name [get]
func (controller *TetapanTypeController) FindByGroupName(ctx *gin.Context) {
	log.Info().Msg("findbygroupname tetapan type")

	groupName := ctx.Param("group_name")
	result, err := controller.tetapanTypeRepository.FindByGroupName(groupName)
	errors.InternalServerError(ctx, err, "failed to retrieve tetapan type by group name")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}
