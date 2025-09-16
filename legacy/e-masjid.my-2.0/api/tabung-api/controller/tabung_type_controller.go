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

type TabungTypeController struct {
	tabungTypeService service.TabungTypeService
}

func NewTabungTypeController(service service.TabungTypeService) *TabungTypeController {
	return &TabungTypeController{
		tabungTypeService: service,
	}
}

// FindAll		godoc
//
//	@Summary		Get All tabung type.
//	@Description	Return the all Tabung type.
//	@Produce		application/json
//	@Tags			tabung type
//	@Success		200	{object}	[]model.TabungType
//	@Router			/tabung-types [get]
func (controller *TabungTypeController) FindAll(ctx *gin.Context) {
	log.Info().Msg("get tabung types")

	result, err := controller.tabungTypeService.FindAll(ctx)
	errors.InternalServerError(ctx, err, "failed to retrieve tabung types")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// CreateTabung		godoc
//
//	@Summary		Create tabung type
//	@Description	Save tabung type data in Db.
//	@Param			tabung	body	model.TabungType	true	"Create Tabung type"
//	@Produce		application/json
//	@Tags			tabung type
//	@Success		200	{object}	model.TabungType{}
//	@Router			/tabung-types [post]
func (controller *TabungTypeController) Save(ctx *gin.Context) {
	log.Info().Msg("save tabung type")

	tabungType := model.TabungType{}
	err := ctx.ShouldBindJSON(&tabungType)
	errors.InternalServerError(ctx, err, "failed to bind JSON")

	err = controller.tabungTypeService.Save(ctx, tabungType)
	errors.InternalServerError(ctx, err, "failed to save tabung type")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}

// DeleteTabung		godoc
//
//	@Summary		Delete tabung type
//	@Description	Remove tabung type data by id.
//	@Param			id	path	string	true	"delete tabung type by id"
//	@Produce		application/json
//	@Tags			tabung type
//	@Router			/tabung-types/{id} [delete]
func (controller *TabungTypeController) Delete(ctx *gin.Context) {
	log.Info().Msg("delete tabung type")

	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	errors.BadRequestError(ctx, err, "invalid id format")

	err = controller.tabungTypeService.Delete(ctx, id)
	errors.InternalServerError(ctx, err, "failed to delete tabung type")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}
