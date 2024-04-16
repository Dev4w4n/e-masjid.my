package controller

import (
	"net/http"
	"strconv"

	errors "github.com/Dev4w4n/e-masjid.my/api/core/error"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/repository"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type DependentController struct {
	dependentRepository repository.DependentRepository
}

func NewDependentController( repo repository.DependentRepository) *DependentController {
	return &DependentController{
		dependentRepository: repo,
	}
}

// Update dependents		godoc
//	@Summary		Update dependents
//	@Description	Save dependents data in Db.
//	@Param			memberId		path	string			true	"memberId"
//	@Param			dependents	body	model.Dependent{}	true	"dependents"
//	@Produce		application/json
//	@Tags			dependents
//	@Router			/dependents/save/{memberId} [post]
func (controller *DependentController) Save(ctx *gin.Context) {
	log.Info().Msg("save dependent")

	saveDependent := model.Dependent{}
	err := ctx.ShouldBindJSON(&saveDependent)
	errors.BadRequestError(ctx, err, "failed to bind JSON")

	memberIdStr := ctx.Param("memberId")

	memberId, err := strconv.Atoi(memberIdStr)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	err = controller.dependentRepository.Save(saveDependent, int64(memberId))

	errors.InternalServerError(ctx, err, "failed to save dependent")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}

// Delete		godoc
//	@Summary		Delete dependents
//	@Description	Remove dependents data by memberId.
//	@Param			memberId	path	string	true	"delete dependents by memberId"
//	@Produce		application/json
//	@Tags			dependents
//	@Router			/dependents/delete/{memberId} [delete]
func (controller *DependentController) Delete(ctx *gin.Context) {
	log.Info().Msg("delete dependent")

	idStr := ctx.Param("memberId")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	err = controller.dependentRepository.DeleteById(id)

	errors.InternalServerError(ctx, err, "failed to delete dependent")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}

// FindAllByMemberId		godoc
//	@Summary		Get All Kutipan by id.
//	@Description	Return the all dependent by memberid.
//	@Produce		application/json
//	@Param			memberid	path	string	true	"get all dependent by memberid"
//	@Tags			dependents
//	@Success		200	{object}	[]model.Dependent
//	@Router			/dependents/findByMemberId/{memberid} [get]
func (controller *DependentController) FindAllByMemberId(ctx *gin.Context) {
	log.Info().Msg("find all dependent by member id")

	memberIdStr := ctx.Param("memberId")

	memberId, err := strconv.Atoi(memberIdStr)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	result, err := controller.dependentRepository.FindAllByMemberId(memberId)

	errors.InternalServerError(ctx, err, "failed to find all dependent")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}
