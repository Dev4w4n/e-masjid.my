package controller

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api-go/repository"
	"github.com/gin-gonic/gin"
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
	controller.engine.GET("/tetapan/{kunci}", controller.FindByKunci)
	controller.engine.POST("/tetapan", controller.Save)
	controller.engine.POST("/tetapan/senarai", controller.SaveAll)

	return controller
}

func (controller *TetapanController) FindAll(ctx *gin.Context) {
	result, err := controller.tetapanRepository.FindAll()

	if err != nil {
		log.Println(fmt.Errorf("failed to retrieve tetapan list: %w", err))
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
	}

	ctx.JSON(http.StatusOK, result)
}

func (controller *TetapanController) FindByKunci(ctx *gin.Context) {
	kunci := ""
	result, err := controller.tetapanRepository.FindByKunci(kunci)

	if err != nil {
		log.Println(fmt.Errorf("failed to retrieve tetapan: %w", err))
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
	}

	ctx.JSON(http.StatusOK, result)
}

func (controller *TetapanController) Save(c *gin.Context) {
	log.Println("save")
}

func (controller *TetapanController) SaveAll(c *gin.Context) {
	log.Println("saveAll")
}
