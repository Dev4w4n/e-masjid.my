package controller

import (
	"net/http"
	"strconv"

	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/service"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/utils"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type MemberController struct {
	engine        *gin.Engine
	memberService service.MemberService
}

func NewMemberController(engine *gin.Engine, memberService service.MemberService, env *utils.Environment) *MemberController {
	controller := &MemberController{
		engine:        engine,
		memberService: memberService,
	}

	relativePath := env.DeployURL + "members"

	engine.GET(relativePath+"/findAll", controller.FindAll)
	engine.GET(relativePath+"/find/:id", controller.FindById)
	engine.GET(relativePath+"/findBy", controller.FindBy)
	engine.GET(relativePath+"/findByTag", controller.FindByTagId)
	engine.GET(relativePath+"/count", controller.CountAll)
	engine.POST(relativePath+"/save", controller.Save)

	return controller
}

func (controller *MemberController) FindAll(ctx *gin.Context) {
	log.Info().Msg("find all member")

	result, err := controller.memberService.FindAll()

	utils.WebError(ctx, err, "failed to retrieve member list")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *MemberController) FindById(ctx *gin.Context) {
	log.Info().Msg("find member by id")

	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	result, err := controller.memberService.FindOne(id)

	utils.WebError(ctx, err, "failed to retrieve member")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *MemberController) FindBy(ctx *gin.Context) {
	log.Info().Msg("find member by")

	query := ctx.Query("query")

	result, err := controller.memberService.FindByQuery(query)

	utils.WebError(ctx, err, "failed to retrieve member")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *MemberController) FindByTagId(ctx *gin.Context) {
	log.Info().Msg("find member by tag id")

	tagIdStr := ctx.Query("tagId")

	result, err := controller.memberService.FindAllByTagIdOrderByMemberName(tagIdStr)

	utils.WebError(ctx, err, "failed to retrieve member")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *MemberController) CountAll(ctx *gin.Context) {
	log.Info().Msg("count all member")

	result, err := controller.memberService.CountAll()

	utils.WebError(ctx, err, "failed to count member")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, result)
}

func (controller *MemberController) Save(ctx *gin.Context) {
	log.Info().Msg("save member")

	member := model.Member{}
	err := ctx.ShouldBindJSON(&member)

	utils.WebError(ctx, err, "failed to bind JSON")

	member, err = controller.memberService.Save(member)

	utils.WebError(ctx, err, "failed to save member")

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, member)
}
