package router

import (
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/controller"
	"github.com/gin-gonic/gin"
)

func NewTetapanPublicRouter(controller *controller.TetapanController, router *gin.Engine) *gin.Engine {
	
	controllerRouter := router.Group("/tetapan")
	controllerRouter.GET("", controller.FindAll)
	controllerRouter.GET("/:kunci", controller.FindByKunci)

	return router
}
