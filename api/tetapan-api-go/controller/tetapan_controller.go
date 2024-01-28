package controller

import (
	"net/http"

	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/utils"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type TetapanController struct {
	engine            *gin.Engine
	tetapanRepository repository.TetapanRepository
}

func NewTetapanController(engine *gin.Engine, repo repository.TetapanRepository, env *utils.Environment) *TetapanController {
	controller := &TetapanController{
		engine:            engine,
		tetapanRepository: repo,
	}

	relativePath := env.DeployURL + "tetapan"

	controller.engine.GET(relativePath, controller.FindAll)
	controller.engine.GET(relativePath+"/:kunci", controller.FindByKunci)
	controller.engine.POST(relativePath, controller.Save)
	controller.engine.POST(relativePath+"/senarai", controller.SaveAll)
	controller.engine.DELETE(relativePath+"/:kunci", controller.Delete)

	return controller
}

func (controller *TetapanController) FindAll(ctx *gin.Context) {
	log.Info().Msg("find all tetapan")

	result, err := controller.tetapanRepository.FindAll()
	utils.WebError(ctx, err, "failed to retrieve tetapan list")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *TetapanController) FindByKunci(ctx *gin.Context) {
	log.Info().Msg("findbykunci tetapan")

	kunci := ctx.Param("kunci")
	result, err := controller.tetapanRepository.FindByKunci(kunci)
	utils.WebError(ctx, err, "failed to retrieve tetapan")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *TetapanController) Save(ctx *gin.Context) {
	log.Info().Msg("save tetapan")

	saveTetapan := model.Tetapan{}
	err := ctx.ShouldBindJSON(&saveTetapan)
	utils.WebError(ctx, err, "failed to bind JSON")

	err = controller.tetapanRepository.Save(saveTetapan)
	utils.WebError(ctx, err, "failed to save tetapan")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}

func (controller *TetapanController) SaveAll(ctx *gin.Context) {
	log.Info().Msg("save all tetapan")

	saveTetapanList := []model.Tetapan{}
	err := ctx.ShouldBindJSON(&saveTetapanList)
	utils.WebError(ctx, err, "failed to bind JSON")

	err = controller.tetapanRepository.SaveAll(saveTetapanList)
	utils.WebError(ctx, err, "failed to save tetapan")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}

func (controller *TetapanController) Delete(ctx *gin.Context) {
	log.Info().Msg("delete tetapan")

	kunci := ctx.Param("kunci")
	err := controller.tetapanRepository.Delete(kunci)
	utils.WebError(ctx, err, "failed to delete tetapan")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}
