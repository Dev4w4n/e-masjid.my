package router

import (
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-public-api/controller"
	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	"github.com/gin-gonic/gin"
)

func NewCadanganPublicRouter(controller *controller.CadanganController, router *gin.Engine, env *env.Environment) *gin.Engine {

	controllerRouter := router.Group(env.DeployURL + "cadangan")
	controllerRouter.POST("", controller.Save)

	return router
}
