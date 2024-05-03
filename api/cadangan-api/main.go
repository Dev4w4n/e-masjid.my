package main

import (
	"log"
	"net/http"
	"os"

	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/controller"
	_ "github.com/Dev4w4n/e-masjid.my/api/cadangan-api/docs"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/helper"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/router"
	"github.com/Dev4w4n/e-masjid.my/api/core/config"
	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title			Cadangan Service API
// @version		1.0
// @description	A Cadangan service API in Go using Gin framework
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

	cadanganRepository := repository.NewCadanganRepository(db)
	cadanganController := controller.NewCadanganController(cadanganRepository)

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowHeaders = []string{"*"}
	config.AllowCredentials = true
	config.MaxAge = 3600
	config.AllowOrigins = []string{env.AllowOrigins}
	config.AllowMethods = []string{"PUT", "GET", "DELETE"}

	// Router
	gin.SetMode(gin.ReleaseMode)
	_router := gin.Default()
	_router.Use(cors.New(config))

	// enable swagger for dev env
	isLocalEnv := os.Getenv("GO_ENV")
	if isLocalEnv == "local" || isLocalEnv == "dev" {
		_router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	routes := router.NewCadanganRouter(cadanganController, _router, env)

	server := &http.Server{
		Addr:    ":" + env.ServerPort,
		Handler: routes,
	}

	log.Println("Server listening on port ", env.ServerPort)

	err = server.ListenAndServe()
	helper.ErrorPanic(err)
}
