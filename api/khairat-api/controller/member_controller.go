package controller

import (
	"io"
	"net/http"
	"strconv"

	errors "github.com/Dev4w4n/e-masjid.my/api/core/error"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/service"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/utils"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type MemberController struct {
	memberService service.MemberService
}

func NewMemberController(memberService service.MemberService) *MemberController {
	return &MemberController{
		memberService: memberService,
	}
}

// FindAll		godoc
//
//	@Summary		find all member
//	@Description	Return the all member.
//	@Produce		application/json
//	@Tags			members
//	@Success		200	{object}	model.Response
//	@Router			/members/findAll [get]
func (controller *MemberController) FindAll(ctx *gin.Context) {
	log.Info().Msg("find all member")

	result, err := controller.memberService.FindAll(ctx)

	errors.InternalServerError(ctx, err, "failed to retrieve member list")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// FindById		godoc
//
//	@Summary		Get member by id.
//	@Description	Return the member by id.
//	@Produce		application/json
//	@Param			id	path	string	true	"get member by id"
//	@Tags			members
//	@Success		200	{object}	model.Member{}
//	@Router			/members/find/{id} [get]
func (controller *MemberController) FindById(ctx *gin.Context) {
	log.Info().Msg("find member by id")

	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	result, err := controller.memberService.FindOne(ctx, id)

	errors.InternalServerError(ctx, err, "failed to retrieve member")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// FindBy		godoc
//
//	@Summary		Get member by id.
//	@Description	Return the member by id.
//	@Produce		application/json
//	@Param			query	query	string	false	"query"
//	@Tags			members
//	@Success		200	{object}	model.Member{}
//	@Router			/members/findBy [get]
func (controller *MemberController) FindBy(ctx *gin.Context) {
	log.Info().Msg("find member by")

	query := ctx.Query("query")

	result, err := controller.memberService.FindByQuery(ctx, query)

	errors.InternalServerError(ctx, err, "failed to retrieve member")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// FindByTagId		godoc
//
//	@Summary		Get member by tag-id.
//	@Description	Return the member by tag-id.
//	@Produce		application/json
//	@Param			tagId	query	string	false	"get member by tagId"
//	@Tags			members
//	@Success		200	{object}	model.Member[]
//	@Router			/members/findByTag/{tagId} [get]
func (controller *MemberController) FindByTagId(ctx *gin.Context) {
	log.Info().Msg("find member by tag id")

	tagIdStr := ctx.Query("tagId")

	result, err := controller.memberService.FindAllByTagIdOrderByMemberName(ctx, tagIdStr)

	errors.InternalServerError(ctx, err, "failed to retrieve member")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// CountAll		godoc
//
//	@Summary		total count of member.
//	@Description	Return member count.
//	@Produce		application/json
//	@Tags			members
//	@Router			/members/count [get]
func (controller *MemberController) CountAll(ctx *gin.Context) {
	log.Info().Msg("count all member")

	result, err := controller.memberService.CountAll(ctx)

	errors.InternalServerError(ctx, err, "failed to count member")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

// Save	godoc
//
//	@Summary		Create Member
//	@Description	Save Member data in Db.
//	@Param			tags	body	model.Member	true	"Create Member"
//	@Produce		application/json
//	@Tags			members
//	@Success		200	{object}	model.Member{}
//	@Router			/members/save [post]
func (controller *MemberController) Save(ctx *gin.Context) {
	log.Info().Msg("save member")

	member := model.Member{}
	err := ctx.ShouldBindJSON(&member)

	errors.BadRequestError(ctx, err, "failed to bind JSON")

	member, err = controller.memberService.Save(ctx, member)

	errors.InternalServerError(ctx, err, "failed to save member")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, member)
}

// SaveCsv	godoc
//
//	@Summary		SaveCsv
//	@Description	Save Member data in Db.
//	@ID				file.upload
//	@Accept			multipart/form-data
//	@Param			file	formData	file	true	"csv file"
//	@Produce		application/json
//	@Tags			members
//	@Success		200	{object}	[]model.Member
//	@Router			/members/saveCsv [post]
func (controller *MemberController) SaveCsv(ctx *gin.Context) {
	log.Info().Msg("save csv")

	requestBody, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to read request body"})
		return
	}

	requestBodyString := string(requestBody)

	members, err := utils.ConvertCsvToMembers(requestBodyString)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to convert CSV to members"})
		return
	}

	result, err := controller.memberService.SaveBulk(ctx, members)
	if err != nil || !result {
		ctx.JSON(500, gin.H{"error": "Failed to save members"})
		return
	}

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusCreated, members)
}
