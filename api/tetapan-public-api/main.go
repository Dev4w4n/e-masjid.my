package main

import (
	"log"
	"net/http"
	"os"

	"github.com/Dev4w4n/e-masjid.my/api/core/config"
	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/controller"
	_ "github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/docs"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/helper"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/router"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

//	@title			Tetapan Public Service API
//	@version		1.0
//	@description	A Tetapan Public service API in Go using Gin framework
func main() {
	log.Println("Starting server ...")

	env, err := env.GetEnvironment()
	if err != nil {
		log.Fatalf("Error getting environment: %v", err)
	}

	db, err := config.DatabaseConnection(env)
	if err != nil {
		log.Fatalf("Error getting database connection: %v", err)
	}

	tetapanRepository := repository.NewTetapanRepository(db)
	tetapanController := controller.NewTetapanController(tetapanRepository)

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{env.AllowOrigins,"http://localhost:4000"}
	config.AllowMethods = []string{"GET", "POST", "DELETE"}

	// Router
	gin.SetMode(gin.ReleaseMode)
	_router := gin.Default()
	_router.Use(cors.New(config))
	_router.Use(controllerMiddleware())

	// enable swagger for dev env
	isLocalEnv := os.Getenv("GO_ENV")
	if (isLocalEnv == "local" || isLocalEnv == "dev") {
		_router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	var routes *gin.Engine = _router
	routes = router.NewTetapanPublicRouter(tetapanController,routes)

	server := &http.Server{
		Addr:    ":" + env.ServerPort,
		Handler: routes,
	}
	
	log.Println("Server listening on port ", env.ServerPort)

	err = server.ListenAndServe()
	helper.ErrorPanic(err)
}

// Strictly allow from allowedOrigin
func controllerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if the request same-origin is allowed
		secFetchSite := c.Request.Header.Get("Sec-Fetch-Site")

		log.Println("secFetchSite: ", secFetchSite)

		if secFetchSite != "same-origin" && secFetchSite != "same-site" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
			c.Abort()
			return
		}
	}
}
