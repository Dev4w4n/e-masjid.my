package controller

import (
	"net/http"
	"strconv"

	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/service"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/utils"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type KutipanController struct {
	engine         *gin.Engine
	kutipanService service.KutipanService
}

func NewKutipanController(engine *gin.Engine, svc service.KutipanService, env *utils.Environment) *KutipanController {
	controller := &KutipanController{
		engine:         engine,
		kutipanService: svc,
	}

	relativePath := env.DeployURL + "kutipan"

	controller.engine.GET(relativePath+"/tabung/:tabungId", controller.FindAllByTabungId)
	controller.engine.GET(relativePath+"/tabung/:tabungId/betweenCreateDate", controller.FindAllByTabungIdBetweenCreateDate)
	controller.engine.GET(relativePath+"/:id", controller.FindById)
	controller.engine.POST(relativePath, controller.Save)

	return controller
}

func (controller *KutipanController) FindAllByTabungId(ctx *gin.Context) {
	log.Info().Msg("get kutipan list by tabung id")

	tabungIdStr := ctx.Param("tabungId")
	tabungId, err := strconv.ParseInt(tabungIdStr, 10, 64)
	utils.BadRequestError(ctx, err, "invalid id format")

	result, err := controller.kutipanService.FindAllByTabungId(tabungId)
	utils.InternalServerError(ctx, err, "failed to retrieve kutipan list by tabung id")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *KutipanController) FindAllByTabungIdBetweenCreateDate(ctx *gin.Context) {
	log.Info().Msg("get kutipan list by tabung id between create date")

	tabungIdStr := ctx.Param("tabungId")
	tabungId, err := strconv.ParseInt(tabungIdStr, 10, 64)
	utils.BadRequestError(ctx, err, "invalid id format")

	queryParams := ctx.Request.URL.Query()
	fromDateStr := queryParams.Get("fromDate")
	fromDate, err := strconv.ParseInt(fromDateStr, 10, 64)
	utils.BadRequestError(ctx, err, "invalid fromDate")

	toDateStr := queryParams.Get("toDate")
	toDate, err := strconv.ParseInt(toDateStr, 10, 64)
	utils.BadRequestError(ctx, err, "invalid toDate")

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
	utils.InternalServerError(ctx, err, "failed to retrieve kutipan list by tabung id between create date")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *KutipanController) FindById(ctx *gin.Context) {
	log.Info().Msg("get kutipan by id")

	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	utils.BadRequestError(ctx, err, "invalid id format")

	result, err := controller.kutipanService.FindById(id)
	utils.InternalServerError(ctx, err, "failed to retrieve kutipan by id")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *KutipanController) Save(ctx *gin.Context) {
	log.Info().Msg("save kutipan")

	kutipan := model.Kutipan{}
	err := ctx.ShouldBindJSON(&kutipan)
	utils.InternalServerError(ctx, err, "failed to bind JSON")

	kutipan, err = controller.kutipanService.Save(kutipan)
	utils.InternalServerError(ctx, err, "failed to save kutipan")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, kutipan)
}
