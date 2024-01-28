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

	cadanganTypeID := ctx.Query("cadanganTypeId")
	isOpen := ctx.Query("isOpen")
	open, err := strconv.ParseBool(isOpen)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid bool format"})
		return
	}

	if cadanganTypeID == "" {
		response, err = controller.cadanganRepository.GetCadanganByIsOpen(open)
		utils.WebError(ctx, err, "failed to get all cadangan by open")
	} else {
		id, err := strconv.Atoi(cadanganTypeID)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
			return
		}
		response, err = controller.cadanganRepository.GetCadanganById(id, open)
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
