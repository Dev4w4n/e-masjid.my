package controller

import (
	"net/http"
	"strconv"

	errors "github.com/Dev4w4n/e-masjid.my/api/core/error"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/service"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type TabungController struct {
	tabungService service.TabungService
}

func NewTabungController(service service.TabungService) *TabungController {
	return &TabungController{
		tabungService: service,
	}
}

// FindAll		godoc
//	@Summary		Get All tabung.
//	@Description	Return the all Tabung.
//	@Produce		application/json
//	@Tags			tabung
//	@Success		200	{object}	[]model.Tabung
//	@Router			/tabung [get]
func (controller *TabungController) FindAll(ctx *gin.Context) {
	log.Info().Msg("get tabung list")

	result, err := controller.tabungService.FindAll()
	errors.InternalServerError(ctx, err, "failed to retrieve tabung list")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// FindById 			godoc
//	@Summary		Get  tabung by ID.
//	@Description	Return the Tabung.
//	@Produce		application/json
//	@Param			id	path	string	true	"get tabung by id"
//	@Tags			tabung
//	@Success		200	{object}	model.Tabung
//	@Router			/tabung/{id} [get]
func (controller *TabungController) FindById(ctx *gin.Context) {
	log.Info().Msg("get tabung by id")

	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	errors.BadRequestError(ctx, err, "invalid id format")

	result, err := controller.tabungService.FindById(id)
	errors.InternalServerError(ctx, err, "failed to retrieve tabung")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// CreateTabung		godoc
//	@Summary		Create tabung
//	@Description	Save tabung data in Db.
//	@Param			tabung	body	model.Tabung	true	"Create Tabung"
//	@Produce		application/json
//	@Tags			tabung
//	@Success		200	{object}	model.Tabung{}
//	@Router			/tabung [post]
func (controller *TabungController) Save(ctx *gin.Context) {
	log.Info().Msg("save tabung type")

	tabung := model.Tabung{}
	err := ctx.ShouldBindJSON(&tabung)
	errors.InternalServerError(ctx, err, "failed to bind JSON")

	tabung, err = controller.tabungService.Save(tabung)
	errors.InternalServerError(ctx, err, "failed to save tabung")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, tabung)
}

// DeleteTabung		godoc
//	@Summary		Delete tabung
//	@Description	Remove tabung data by id.
//	@Param			id	path	string	true	"delete tabung by id"
//	@Produce		application/json
//	@Tags			tabung
//	@Router			/tabung/{id} [delete]
func (controller *TabungController) Delete(ctx *gin.Context) {
	log.Info().Msg("delete tabung type")

	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	errors.BadRequestError(ctx, err, "invalid id format")

	err = controller.tabungService.Delete(id)
	errors.InternalServerError(ctx, err, "failed to delete tabung")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}