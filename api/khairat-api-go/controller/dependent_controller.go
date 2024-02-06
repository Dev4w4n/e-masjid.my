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

type DependentController struct {
	engine              *gin.Engine
	dependentRepository repository.DependentRepository
}

func NewDependentController(engine *gin.Engine, repo repository.DependentRepository, env *utils.Environment) *DependentController {
	controller := &DependentController{
		engine:              engine,
		dependentRepository: repo,
	}

	relativePath := env.DeployURL + "dependents"

	controller.engine.POST(relativePath+"/save/:memberId", controller.Save)
	controller.engine.DELETE(relativePath+"/delete/:memberId", controller.Delete)
	controller.engine.GET(relativePath+"/findByMemberId/:memberId", controller.FindAllByMemberId)

	return controller
}

func (controller *DependentController) Save(ctx *gin.Context) {
	log.Info().Msg("save dependent")

	saveDependent := model.Dependent{}
	err := ctx.ShouldBindJSON(&saveDependent)
	utils.WebError(ctx, err, "failed to bind JSON")

	memberIdStr := ctx.Param("memberId")

	memberId, err := strconv.Atoi(memberIdStr)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	err = controller.dependentRepository.Save(saveDependent, int64(memberId))

	utils.WebError(ctx, err, "failed to save dependent")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}

func (controller *DependentController) Delete(ctx *gin.Context) {
	log.Info().Msg("delete dependent")

	idStr := ctx.Param("memberId")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	err = controller.dependentRepository.DeleteById(id)

	utils.WebError(ctx, err, "failed to delete dependent")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}

func (controller *DependentController) FindAllByMemberId(ctx *gin.Context) {
	log.Info().Msg("find all dependent by member id")

	memberIdStr := ctx.Param("memberId")

	memberId, err := strconv.Atoi(memberIdStr)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	result, err := controller.dependentRepository.FindAllByMemberId(memberId)

	utils.WebError(ctx, err, "failed to find all dependent")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}
