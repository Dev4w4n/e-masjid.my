package controller

import (
	"net/http"

	errors "github.com/Dev4w4n/e-masjid.my/api/core/error"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/repository"
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
//	@Summary		find all tetapan
//	@Description	Return  all tetapan
//	@Produce		application/json
//	@Tags			tetapan
//	@Success		200	{array}	model.Tetapan
//	@Router			/tetapan [get]
func (controller *TetapanController) FindAll(ctx *gin.Context) {
	log.Info().Msg("find all tetapan")

	result, err := controller.tetapanRepository.FindAll()
	errors.InternalServerError(ctx, err, "failed to retrieve tetapan list")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// FindByKunci		godoc
//	@Summary		find tetapan by kunci
//	@Description	Return  all tetapan by kunci
//	@Produce		application/json
//	@Param			kunci	path	string	true	"get tetapan by kunci"
//	@Tags			tetapan
//	@Success		200	{object}	model.Tetapan
//	@Router			/tetapan/{kunci} [get]
func (controller *TetapanController) FindByKunci(ctx *gin.Context) {
	log.Info().Msg("findbykunci tetapan")

	kunci := ctx.Param("kunci")
	result, err := controller.tetapanRepository.FindByKunci(kunci)
	errors.InternalServerError(ctx, err, "failed to retrieve tetapan")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// Save	godoc
//	@Summary		Save tetapan
//	@Description	Save tetapan data in Db.
//	@Param			tetapan	body	model.Tetapan	true	"Save Tetapan"
//	@Produce		application/json
//	@Tags			tetapan
//	@Router			/tetapan [post]
func (controller *TetapanController) Save(ctx *gin.Context) {
	log.Info().Msg("save tetapan")

	saveTetapan := model.Tetapan{}
	err := ctx.ShouldBindJSON(&saveTetapan)
	errors.BadRequestError(ctx, err, "failed to bind JSON")

	err = controller.tetapanRepository.Save(saveTetapan)
	errors.InternalServerError(ctx, err, "failed to save tetapan")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}

// SaveAll	godoc
//	@Summary		BulkSave tetapan
//	@Description	BulkSave tetapan data in Db.
//	@Param			tetapan	body	[]model.Tetapan	true	"BulkSave Tetapan"
//	@Produce		application/json
//	@Tags			tetapan
//	@Router			/tetapan/senarai [post]
func (controller *TetapanController) SaveAll(ctx *gin.Context) {
	log.Info().Msg("save all tetapan")

	saveTetapanList := []model.Tetapan{}
	err := ctx.ShouldBindJSON(&saveTetapanList)
	errors.BadRequestError(ctx, err, "failed to bind JSON")

	err = controller.tetapanRepository.SaveAll(saveTetapanList)
	errors.InternalServerError(ctx, err, "failed to save tetapan")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}

// Delete		godoc
//	@Summary		Delete tetapan
//	@Description	Remove tetapan data by kunci.
//	@Param			kunci	path	string	true	"delete tetapan by kunci"
//	@Produce		application/json
//	@Tags			tetapan
//	@Router			/tetapan/{kunci} [delete]
func (controller *TetapanController) Delete(ctx *gin.Context) {
	log.Info().Msg("delete tetapan")

	kunci := ctx.Param("kunci")
	err := controller.tetapanRepository.Delete(kunci)
	errors.InternalServerError(ctx, err, "failed to delete tetapan")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}
