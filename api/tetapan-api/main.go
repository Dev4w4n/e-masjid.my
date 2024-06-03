package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	"github.com/Dev4w4n/e-masjid.my/api/core/security"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/controller"
	_ "github.com/Dev4w4n/e-masjid.my/api/tetapan-api/docs"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/helper"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api/router"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	sgin "github.com/go-saas/saas/gin"
	shttp "github.com/go-saas/saas/http"
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

	//repository
	tetapanRepository := repository.NewTetapanRepository()
	tetapanTypeRepository := repository.NewTetapanTypeRepository()

	//controller
	tetapanController := controller.NewTetapanController(tetapanRepository)
	tetapanTypeController := controller.NewTetapanTypeController(tetapanTypeRepository)

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowCredentials = true
	config.MaxAge = 3600
	config.AllowMethods = []string{"GET", "POST", "DELETE"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	config.AllowOriginFunc = func(origin string) bool {
		return security.IsAllowedOrigin(origin, env.AllowOrigins)
	}

	// Router
	gin.SetMode(gin.ReleaseMode)

	sharedDsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		env.DbHost, env.DbUser, env.DbPassword, env.DbName, env.DbPort)

	emasjidsaas.InitSaas(sharedDsn)

	_router := gin.Default()
	_router.Use(cors.New(config))

	isLocalEnv := os.Getenv("GO_ENV")
	if isLocalEnv == "local" || isLocalEnv == "dev" {
		// enable swagger for dev env
		_router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
		// enable multi tenancy for dev
		_router.Use(sgin.MultiTenancy(emasjidsaas.TenantStorage))
	} else if isLocalEnv == "prod" {
		// enable keycloak for prod env
		_router.Use(security.AuthMiddleware)
		// enable multi tenancy for *.e-masjid.my
		_router.Use(sgin.MultiTenancy(emasjidsaas.TenantStorage,
			sgin.WithMultiTenancyOption(shttp.NewWebMultiTenancyOption("", "([-a-z0-9]+)\\.e-masjid\\.my"))))
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
