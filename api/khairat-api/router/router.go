package router

import (
	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/controller"
	"github.com/gin-gonic/gin"
)

func NewDependentRouter(controller *controller.DependentController, router *gin.Engine, env *env.Environment) *gin.Engine {

	controllerRouter := router.Group(env.DeployURL + "dependents")
	controllerRouter.GET("/findByMemberId/:memberId", controller.FindAllByMemberId)
	controllerRouter.POST("/save/:memberId", controller.Save)
	controllerRouter.DELETE("/delete/:memberId", controller.Delete)

	return router
}

func NewMemberRouter(controller *controller.MemberController, router *gin.Engine, env *env.Environment) *gin.Engine {

	controllerRouter := router.Group(env.DeployURL + "members")
	controllerRouter.GET("/findAll", controller.FindAll)
	controllerRouter.GET("/find/:id", controller.FindById)
	controllerRouter.GET("/findBy", controller.FindBy)
	controllerRouter.GET("/findByTag", controller.FindByTagId)
	controllerRouter.GET("/count", controller.CountAll)
	controllerRouter.POST("/save", controller.Save)
	controllerRouter.POST("/saveCsv", controller.SaveCsv)

	return router
}

func NewPaymentHistoryRouter(controller *controller.PaymentHistoryController, router *gin.Engine, env *env.Environment) *gin.Engine {

	controllerRouter := router.Group(env.DeployURL + "payment")
	controllerRouter.GET("/totalMembersPaidForCurrentYear", controller.GetTotalMembersPaidForCurrentYear)
	return router
}

func NewTagRouter(controller *controller.TagController, router *gin.Engine, env *env.Environment) *gin.Engine {

	controllerRouter := router.Group(env.DeployURL + "tags")
	controllerRouter.GET("/findAll", controller.FindAll)
	controllerRouter.POST("/save", controller.Save)
	controllerRouter.DELETE("/delete/:id", controller.Delete)
	return router
}
