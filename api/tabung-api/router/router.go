package router

import (
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/controller"
	"github.com/gin-gonic/gin"
)

func NewTabungRouter(controller *controller.TabungController, router *gin.Engine) *gin.Engine {
	
	controllerRouter := router.Group("/tabung")
	controllerRouter.GET("", controller.FindAll)
	controllerRouter.GET("/:id", controller.FindById)
	controllerRouter.POST("", controller.Save)
	controllerRouter.DELETE("/:id", controller.Delete)

	return router
}

func NewTabungTypeRouter(controller *controller.TabungTypeController, router *gin.Engine) *gin.Engine {
	
	controllerRouter := router.Group("/tabung-types")
	controllerRouter.GET("", controller.FindAll)
	controllerRouter.POST("", controller.Save)
	controllerRouter.DELETE("/:id", controller.Delete)

	return router
}


func NewKutipanRouter(controller *controller.KutipanController, router *gin.Engine) *gin.Engine {
	
	controllerRouter := router.Group("/kutipan")
	controllerRouter.GET("/tabung/:tabungId", controller.FindAllByTabungId)
	controllerRouter.GET("/tabung/:tabungId/betweenCreateDate", controller.FindAllByTabungIdBetweenCreateDate)
	controllerRouter.GET("/:id", controller.FindById)
	controllerRouter.POST("", controller.Create)
	controllerRouter.PUT("/:id", controller.Update)
	controllerRouter.DELETE("/:id", controller.Delete)

	return router
}
