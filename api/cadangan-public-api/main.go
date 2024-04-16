package main

import (
	"log"
	"net/http"
	"os"
	"slices"

	"github.com/Dev4w4n/e-masjid.my/api/cadangan-public-api/controller"
	_ "github.com/Dev4w4n/e-masjid.my/api/cadangan-public-api/docs"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-public-api/helper"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-public-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-public-api/router"
	"github.com/Dev4w4n/e-masjid.my/api/core/config"
	"github.com/Dev4w4n/e-masjid.my/api/core/env"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

//	@title			Cadangan Public Service API
//	@version		1.0
//	@description	A Tabung service API in Go using Gin framework
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
	config.AllowOrigins = []string{env.AllowOrigins,"http://localhost:4000"}
	config.AllowMethods = []string{"POST"}

	// Router
	gin.SetMode(gin.ReleaseMode)
	_router := gin.Default()
	_router.Use(cors.New(config))
	_router.Use(controllerMiddleware(env))

	// enable swagger for dev env
	isLocalEnv := os.Getenv("GO_ENV")
	if (isLocalEnv == "local" || isLocalEnv == "dev") {
		_router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	var routes *gin.Engine = _router
	routes = router.NewCadanganPublicRouter(cadanganController,routes)

	server := &http.Server{
		Addr:    ":" + env.ServerPort,
		Handler: routes,
	}
	
	log.Println("Server listening on port ", env.ServerPort)

	err = server.ListenAndServe()
	helper.ErrorPanic(err)
}

// Strictly allow from allowedOrigin
func controllerMiddleware(env *env.Environment) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if the request origin is allowed
		allowedOrigin := []string{env.AllowOrigins,"http://localhost:4000"}
		origin := c.GetHeader("Origin")

		log.Println("Origin: ", origin)
		if slices.Contains(allowedOrigin, origin) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
			c.Abort()
			return
		}
	}
}
