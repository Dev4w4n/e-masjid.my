package controller

import (
	"fmt"
	"net/http"

	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api-go/model"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api-go/repository"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type TetapanController struct {
	engine            *gin.Engine
	tetapanRepository repository.TetapanRepository
}

func NewTetapanController(engine *gin.Engine, repo repository.TetapanRepository) *TetapanController {
	controller := &TetapanController{
		engine:            engine,
		tetapanRepository: repo,
	}

	controller.engine.GET("/tetapan", controller.FindAll)
	controller.engine.GET("/tetapan/:kunci", controller.FindByKunci)
	controller.engine.POST("/tetapan", controller.Save)
	// controller.engine.POST("/tetapan/senarai", controller.SaveAll)

	return controller
}

func (controller *TetapanController) FindAll(ctx *gin.Context) {
	log.Info().Msg("find all tetapan")

	var errorMessage string
	result, err := controller.tetapanRepository.FindAll()

	if err != nil {
		errorMessage = fmt.Sprintf("failed to retrieve tetapan list: %v", err)
		log.Error().Msg(errorMessage)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": errorMessage})
	}

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *TetapanController) FindByKunci(ctx *gin.Context) {
	log.Info().Msg("findbykunci tetapan")

	var errorMessage string
	kunci := ctx.Param("kunci")
	result, err := controller.tetapanRepository.FindByKunci(kunci)

	if err != nil {
		errorMessage = fmt.Sprintf("failed to retrieve tetapan: %v", err)
		log.Error().Msg(errorMessage)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": errorMessage})
	}

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *TetapanController) Save(ctx *gin.Context) {
	log.Info().Msg("save tetapan")

	var errorMessage string
	saveTetapan := model.Tetapan{}
	err := ctx.ShouldBindJSON(&saveTetapan)

	if err != nil {
		errorMessage = fmt.Sprintf("failed to bind JSON: %v", err)
		log.Error().Msg(errorMessage)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": errorMessage})
	}

	err = controller.tetapanRepository.Save(saveTetapan)

	if err != nil {
		errorMessage = fmt.Sprintf("failed to save tetapan: %v", err)
		log.Error().Msg(errorMessage)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": errorMessage})
	}

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}

// func (controller *TetapanController) SaveAll(ctx *gin.Context) {
// 	log.Info().Msg("save all tetapan")
// 	ctx.Header("Content-Type", "application/json")
// 	ctx.JSON(http.StatusOK, result)
// }
