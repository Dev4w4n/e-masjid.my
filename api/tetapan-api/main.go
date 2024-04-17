package main

import (
	"log"
	"net/http"
	"os"

	"github.com/Dev4w4n/e-masjid.my/api/core/config"
	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/controller"
	_ "github.com/Dev4w4n/e-masjid.my/api/tetapan-api/docs"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/helper"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/router"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title			Tetapan Service API
// @version		1.0
// @description	A Tetapan service API in Go using Gin framework
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

	//repository
	tetapanRepository := repository.NewTetapanRepository(db)
	tetapanTypeRepository := repository.NewTetapanTypeRepository(db)

	//controller
	tetapanController := controller.NewTetapanController(tetapanRepository)
	tetapanTypeController := controller.NewTetapanTypeController(tetapanTypeRepository)

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{env.AllowOrigins, "http://localhost:4000"}
	config.AllowMethods = []string{"GET", "POST", "DELETE"}

	// Router
	gin.SetMode(gin.ReleaseMode)
	_router := gin.Default()
	_router.Use(cors.New(config))

	// enable swagger for dev env
	isLocalEnv := os.Getenv("GO_ENV")
	if isLocalEnv == "local" || isLocalEnv == "dev" {
		_router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	var routes *gin.Engine = _router
	routes = router.NewTetapanRouter(tetapanController, routes, env)
	routes = router.NewTetapanTypeRouter(tetapanTypeController, routes, env)

	server := &http.Server{
		Addr:    ":" + env.ServerPort,
		Handler: routes,
	}

	log.Println("Server listening on port ", env.ServerPort)

	err = server.ListenAndServe()
	helper.ErrorPanic(err)
}
