package controller

import (
	"net/http"
	"strconv"

	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/utils"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type TagController struct {
	engine        *gin.Engine
	tagRepository repository.TagRepository
}

func NewTagController(engine *gin.Engine, repo repository.TagRepository, env *utils.Environment) *TagController {
	controller := &TagController{
		engine:        engine,
		tagRepository: repo,
	}

	relativePath := env.DeployURL + "tags"

	controller.engine.GET(relativePath+"/findAll", controller.FindAll)
	controller.engine.POST(relativePath+"/save", controller.Save)
	controller.engine.DELETE(relativePath+"/delete/:id", controller.Delete)

	return controller
}

func (controller *TagController) FindAll(ctx *gin.Context) {
	log.Info().Msg("find all tag")

	result, err := controller.tagRepository.FindAll()
	utils.WebError(ctx, err, "failed to retrieve tag list")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *TagController) Save(ctx *gin.Context) {
	log.Info().Msg("save tag")

	saveTag := model.Tag{}
	err := ctx.ShouldBindJSON(&saveTag)
	utils.WebError(ctx, err, "failed to bind JSON")

	err = controller.tagRepository.Save(saveTag)
	utils.WebError(ctx, err, "failed to save tag")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}

func (controller *TagController) Delete(ctx *gin.Context) {
	log.Info().Msg("delete tag")

	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	err2 := controller.tagRepository.Delete(id)
	utils.WebError(ctx, err2, "failed to delete tag")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}
