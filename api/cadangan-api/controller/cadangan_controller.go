package controller

import (
	"net/http"
	"strconv"

	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/repository"
	errors "github.com/Dev4w4n/e-masjid.my/api/core/error"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type CadanganController struct {
	cadanganRepository repository.CadanganRepository
}

func NewCadanganController(repo repository.CadanganRepository) *CadanganController {
	return &CadanganController{
		cadanganRepository: repo,
	}
}

// FindById		godoc
//
//	@Summary		Get All Cadangan by id.
//	@Description	Return the all  Cadangan by id.
//	@Produce		application/json
//	@Param			id	path	string	true	"get cadangan by id"
//	@Tags			cadangan
//	@Router			/cadangan/{id} [get]
func (controller *CadanganController) GetOne(ctx *gin.Context) {
	log.Info().Msg("get all cadangan")
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	result, err := controller.cadanganRepository.GetOne(ctx, id)
	errors.InternalServerError(ctx, err, "failed to get all cadangan")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// FindBycadanganTypeId		godoc
//
//	@Summary		Get All Cadangan by cadanganTypeId.
//	@Description	Return the all  Cadangan by id.
//	@Produce		application/json
//	@Param			cadanganTypeId	query	string	false	"cadanganTypeId"
//	@Param			isOpen	query	boolean	true	"isOpen"
//	@Param			page	query	int	false	"page"
//	@Param			size	query	int	false	"size"
//	@Tags			cadangan
//	@Router			/cadangan [get]
func (controller *CadanganController) GetAllCadanganBy(ctx *gin.Context) {
	var response interface{}
	var open bool
	var page, size int
	var err error

	cadanganTypeID := ctx.Query("cadanganTypeId")

	if open, err = strconv.ParseBool(ctx.Query("isOpen")); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid bool format"})
		return
	}

	if page, err = strconv.Atoi(ctx.Query("page")); err != nil {
		page = 1
	}

	if size, err = strconv.Atoi(ctx.Query("size")); err != nil {
		size = 10
	}

	paginate := model.Paginate{
		Page: page,
		Size: size,
	}

	if cadanganTypeID == "" {
		response, err = controller.cadanganRepository.GetCadanganByIsOpen(ctx, open, paginate)
		errors.InternalServerError(ctx, err, "failed to get all cadangan by open")
	} else {
		id, err := strconv.Atoi(cadanganTypeID)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
			return
		}
		response, err = controller.cadanganRepository.GetCadanganById(ctx, id, open, paginate)
		errors.InternalServerError(ctx, err, "failed to get all cadangan by id")
	}

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, response)
}

// GetCount		godoc
//
//	@Summary		total count of cadangan.
//	@Description	Return Cadangan count.
//	@Produce		application/json
//	@Tags			cadangan
//	@Router			/cadangan/count [get]
func (controller *CadanganController) GetCadanganCount(ctx *gin.Context) {
	log.Info().Msg("get cadangan count")

	result, err := controller.cadanganRepository.GetTotalCadanganByTypeCount(ctx)
	errors.InternalServerError(ctx, err, "failed to get all cadangan")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// CreateCadangan		godoc
//
//	@Summary		Create Cadangan
//	@Description	Save Cadangan data in Db.
//	@Param			Cadangan	body	model.Cadangan	true	"Create Cadangan"
//	@Produce		application/json
//	@Tags			cadangan
//	@Router			/cadangan [put]
func (controller *CadanganController) Save(ctx *gin.Context) {
	log.Info().Msg("save cadangan")

	saveCadangan := model.Cadangan{}
	err := ctx.ShouldBindJSON(&saveCadangan)
	errors.BadRequestError(ctx, err, "failed to bind JSON")

	err = controller.cadanganRepository.Save(ctx, saveCadangan)
	errors.InternalServerError(ctx, err, "failed to save cadangan")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}

// DeleteCadangan		godoc
//
//	@Summary		Delete Cadangan
//	@Description	Remove Cadangandata by id.
//	@Param			id	path	string	true	"delete Cadangan by id"
//	@Produce		application/json
//	@Tags			cadangan
//	@Router			/cadangan/{id} [delete]
func (controller *CadanganController) Delete(ctx *gin.Context) {
	log.Info().Msg("delete cadangan")

	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	err2 := controller.cadanganRepository.Delete(ctx, id)
	errors.InternalServerError(ctx, err2, "failed to delete cadangan")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}
