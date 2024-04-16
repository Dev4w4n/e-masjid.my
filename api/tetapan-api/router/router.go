package router

import (
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/controller"
	"github.com/gin-gonic/gin"
)

func NewTetapanRouter(controller *controller.TetapanController, router *gin.Engine) *gin.Engine {
	
	controllerRouter := router.Group("/tetapan")
	controllerRouter.GET("", controller.FindAll)
	controllerRouter.GET("/:kunci", controller.FindByKunci)
	controllerRouter.POST("", controller.Save)
	controllerRouter.POST("/senarai", controller.SaveAll)
	controllerRouter.DELETE("/:kunci", controller.Delete)

	return router
}

func NewTetapanTypeRouter(controller *controller.TetapanTypeController, router *gin.Engine) *gin.Engine {
	
	controllerRouter := router.Group("/tetapan-types")
	controllerRouter.GET("", controller.FindAllGroupNames)
	controllerRouter.GET("/:group_name", controller.FindByGroupName)

	return router
}
