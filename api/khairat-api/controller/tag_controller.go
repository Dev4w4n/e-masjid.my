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

type TagController struct {
	tagRepository repository.TagRepository
}

func NewTagController( repo repository.TagRepository) *TagController {
	return &TagController{
		tagRepository: repo,
	}
}

// FindAll		godoc
//	@Summary		find all tag
//	@Description	Return the all tag.
//	@Produce		application/json
//	@Tags			tags
//	@Success		200	{object}	model.Response
//	@Router			/tags/findAll [get]
func (controller *TagController) FindAll(ctx *gin.Context) {
	log.Info().Msg("find all tag")

	result, err := controller.tagRepository.FindAll()
	errors.InternalServerError(ctx, err, "failed to retrieve tag list")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// Save	godoc
//	@Summary		save tag
//	@Description	save tag data in Db.
//	@Param			tags	body	model.Tag	true	"save tag"
//	@Produce		application/json
//	@Tags			tags
//	@Router			/tags/save [post]
func (controller *TagController) Save(ctx *gin.Context) {
	log.Info().Msg("save tag")

	saveTag := model.Tag{}
	err := ctx.ShouldBindJSON(&saveTag)
	errors.BadRequestError(ctx, err, "failed to bind JSON")

	err = controller.tagRepository.Save(saveTag)
	errors.InternalServerError(ctx, err, "failed to save tag")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}

// Delete		godoc
//	@Summary		Delete tag
//	@Description	Remove tag data by id.
//	@Param			id	path	string	true	"delete tag by id"
//	@Produce		application/json
//	@Tags			tags
//	@Router			/tags/delete/{id} [delete]
func (controller *TagController) Delete(ctx *gin.Context) {
	log.Info().Msg("delete tag")

	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	err2 := controller.tagRepository.Delete(id)
	errors.InternalServerError(ctx, err2, "failed to delete tag")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}
