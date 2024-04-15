package controller

import (
	"fmt"
	"net/http"
	"strconv"

	errors "github.com/Dev4w4n/e-masjid.my/api/core/error"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/service"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type KutipanController struct {
	kutipanService service.KutipanService
}

func NewKutipanController(service service.KutipanService) *KutipanController {
	return &KutipanController{
		kutipanService: service,
	}
}
 

// FindAll		godoc
//	@Summary		Get All Kutipan by tabungId.
//	@Description	Return the all  Kutipan by tabungId.
//	@Produce		application/json
//	@Param			tabungId	path	string	true	"get kutipan by tabungId"
//	@Tags			kutipan
//	@Success		200	{object}	[]model.Kutipan
//	@Router			/kutipan/tabung/{tabungId} [get]
func (controller *KutipanController) FindAllByTabungId(ctx *gin.Context) {
	log.Info().Msg("get kutipan list by tabung id")

	tabungIdStr := ctx.Param("tabungId")
	tabungId, err := strconv.ParseInt(tabungIdStr, 10, 64)
	errors.BadRequestError(ctx, err, "invalid id format")

	result, err := controller.kutipanService.FindAllByTabungId(tabungId)
	errors.InternalServerError(ctx, err, "failed to retrieve kutipan list by tabung id")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// FindAll		godoc
//	@Summary		Get All Kutipan by tabungId.
//	@Description	Return the all  Kutipan by tabungId.
//	@Produce		application/json
//	@Param			tabungId	path	string	true	"get kutipan by tabungId"
//	@Tags			kutipan
//	@Success		200	{object}	model.Response
//	@Router			/kutipan/tabung/{tabungId}/betweenCreateDate [get]
func (controller *KutipanController) FindAllByTabungIdBetweenCreateDate(ctx *gin.Context) {
	log.Info().Msg("get kutipan list by tabung id between create date")

	tabungIdStr := ctx.Param("tabungId")
	tabungId, err := strconv.ParseInt(tabungIdStr, 10, 64)
	errors.BadRequestError(ctx, err, "invalid id format")

	queryParams := ctx.Request.URL.Query()
	fromDateStr := queryParams.Get("fromDate")
	fromDate, err := strconv.ParseInt(fromDateStr, 10, 64)
	errors.BadRequestError(ctx, err, "invalid fromDate")

	toDateStr := queryParams.Get("toDate")
	toDate, err := strconv.ParseInt(toDateStr, 10, 64)
	errors.BadRequestError(ctx, err, "invalid toDate")

	var page, size int
	if page, err = strconv.Atoi(ctx.Query("page")); err != nil {
		page = 0
	}

	if size, err = strconv.Atoi(ctx.Query("size")); err != nil {
		size = 0
	}

	paginate := model.Paginate{
		Page: page,
		Size: size,
	}

	params := model.QueryParams{
		TabungId: tabungId,
		FromDate: fromDate,
		ToDate:   toDate,
	}

	result, err := controller.kutipanService.FindAllByTabungIdBetweenCreateDate(params, paginate)
	errors.InternalServerError(ctx, err, "failed to retrieve kutipan list by tabung id between create date")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// FindAll		godoc
//	@Summary		Get All Kutipan by id.
//	@Description	Return the all  Kutipan by id.
//	@Produce		application/json
//	@Param			id	path	string	true	"get kutipan by id"
//	@Tags			kutipan
//	@Success		200	{object}	model.Kutipan{}
//	@Router			/kutipan/{id} [get]
func (controller *KutipanController) FindById(ctx *gin.Context) {
	log.Info().Msg("get kutipan by id")

	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	errors.BadRequestError(ctx, err, "invalid id format")

	result, err := controller.kutipanService.FindById(id)
	errors.InternalServerError(ctx, err, "failed to retrieve kutipan by id")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// CreateTabung		godoc
//	@Summary		Create kutipan
//	@Description	Save kutipan data in Db.
//	@Param			tags	body	model.Kutipan	true	"Create kutipan"
//	@Produce		application/json
//	@Tags			kutipan
//	@Success		200	{object}	model.Kutipan{}
//	@Router			/kutipan [post]
func (controller *KutipanController) Create(ctx *gin.Context) {
	log.Info().Msg("save kutipan")

	kutipan := model.Kutipan{}
	err := ctx.ShouldBindJSON(&kutipan)
	errors.InternalServerError(ctx, err, "failed to bind JSON")

	kutipan, err = controller.kutipanService.Upsert(kutipan)
	errors.InternalServerError(ctx, err, "failed to save kutipan")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, kutipan)
}

// CreateTabung		godoc
//	@Summary		Create kutipan
//	@Description	Save kutipan data in Db.
//	@Param			id		path	string			true	"update by id"
//	@Param			kutipan	body	model.Kutipan	true	"update kutipan"
//	@Produce		application/json
//	@Tags			kutipan
//	@Success		200	{object}	model.Kutipan{}
//	@Router			/kutipan/{id} [put]
func (controller *KutipanController) Update(ctx *gin.Context) {
	log.Info().Msg("save kutipan")

	kutipan := model.Kutipan{}
	err := ctx.ShouldBindJSON(&kutipan)
	errors.InternalServerError(ctx, err, "failed to bind JSON")

	idStr := ctx.Param("id")
	if idStr != "" {
		log.Info().Msgf("update kutipan id= %s", idStr)
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
			return
		}
		kutipan.Id = int64(id)
	}

	kutipan, err = controller.kutipanService.Upsert(kutipan)
	errors.InternalServerError(ctx, err, "failed to save kutipan")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, kutipan)
}

// DeleteTabung		godoc
//	@Summary		Delete kutipan
//	@Description	Remove kutipan data by id.
//	@Param			id	path	string	true	"delete kutipan by id"
//	@Produce		application/json
//	@Tags			kutipan
//	@Router			/kutipan/{id} [delete]
func (controller *KutipanController) Delete(ctx *gin.Context) {
	idStr := ctx.Param("id")

	log.Info().Msg(fmt.Sprintf("delete kutipan by id : %s",idStr))
	
	id, err := strconv.ParseInt(idStr, 10, 64)
	errors.BadRequestError(ctx, err, "invalid id format")

	result,errResp := controller.kutipanService.Delete(id)
	errors.InternalServerError(ctx, errResp, fmt.Sprintf("failed to Delete kutipan by id: %s",idStr))

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}
