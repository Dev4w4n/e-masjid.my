package controller

import (
	"net/http"
	"strconv"

	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/utils"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type CadanganController struct {
	engine             *gin.Engine
	cadanganRepository repository.CadanganRepository
}

func NewCadanganController(engine *gin.Engine, repo repository.CadanganRepository, env *utils.Environment) *CadanganController {
	controller := &CadanganController{
		engine:             engine,
		cadanganRepository: repo,
	}

	controller.engine.GET(env.DeployURL+"cadangan", controller.GetAllCadanganBy)
	controller.engine.GET(env.DeployURL+"cadangan/:id", controller.GetOne)
	controller.engine.GET(env.DeployURL+"cadangan/count", controller.GetCadanganCount)
	controller.engine.PUT(env.DeployURL+"cadangan/:id", controller.Save)
	controller.engine.DELETE(env.DeployURL+"cadangan/:id", controller.Delete)

	return controller
}

func (controller *CadanganController) GetOne(ctx *gin.Context) {
	log.Info().Msg("get all cadangan")
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	result, err := controller.cadanganRepository.GetOne(id)
	utils.WebError(ctx, err, "failed to get all cadangan")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

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
		response, err = controller.cadanganRepository.GetCadanganByIsOpen(open, paginate)
		utils.WebError(ctx, err, "failed to get all cadangan by open")
	} else {
		id, err := strconv.Atoi(cadanganTypeID)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
			return
		}
		response, err = controller.cadanganRepository.GetCadanganById(id, open, paginate)
		utils.WebError(ctx, err, "failed to get all cadangan by id")
	}

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, response)
}

func (controller *CadanganController) GetCadanganCount(ctx *gin.Context) {
	log.Info().Msg("get cadangan count")

	result, err := controller.cadanganRepository.GetTotalCadanganByTypeCount()
	utils.WebError(ctx, err, "failed to get all cadangan")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *CadanganController) Save(ctx *gin.Context) {
	log.Info().Msg("save cadangan")

	saveCadangan := model.Cadangan{}
	err := ctx.ShouldBindJSON(&saveCadangan)
	utils.WebError(ctx, err, "failed to bind JSON")

	err = controller.cadanganRepository.Save(saveCadangan)
	utils.WebError(ctx, err, "failed to save cadangan")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}

func (controller *CadanganController) Delete(ctx *gin.Context) {
	log.Info().Msg("delete cadangan")

	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	err2 := controller.cadanganRepository.Delete(id)
	utils.WebError(ctx, err2, "failed to delete cadangan")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}
