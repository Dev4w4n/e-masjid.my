package router

import (
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-public-api/controller"
	"github.com/gin-gonic/gin"
)

func NewCadanganPublicRouter(controller *controller.CadanganController, router *gin.Engine) *gin.Engine {
	
	controllerRouter := router.Group("/cadangan")
	controllerRouter.POST("", controller.Save)

	return router
}