package router

import (
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/controller"
	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	"github.com/gin-gonic/gin"
)

func NewCadanganRouter(controller *controller.CadanganController, router *gin.Engine, env *env.Environment) *gin.Engine {

	controllerRouter := router.Group(env.DeployURL + "cadangan")
	controllerRouter.GET("", controller.GetAllCadanganBy)
	controllerRouter.GET("/:id", controller.GetOne)
	controllerRouter.GET("/count", controller.GetCadanganCount)
	controllerRouter.PUT("/:id", controller.Save)
	controllerRouter.DELETE("/:id", controller.Delete)

	return router
}
