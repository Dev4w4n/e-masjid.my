package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/controller"
	_ "github.com/Dev4w4n/e-masjid.my/api/cadangan-api/docs"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/helper"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/router"
	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	"github.com/Dev4w4n/e-masjid.my/api/core/security"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	sgin "github.com/go-saas/saas/gin"
	shttp "github.com/go-saas/saas/http"
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

	cadanganRepository := repository.NewCadanganRepository()
	cadanganController := controller.NewCadanganController(cadanganRepository)

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowHeaders = []string{"*"}
	config.AllowCredentials = true
	config.MaxAge = 3600
	config.AllowMethods = []string{"PUT", "GET", "DELETE"}
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

	routes := router.NewCadanganRouter(cadanganController, _router, env)

	server := &http.Server{
		Addr:    ":" + env.ServerPort,
		Handler: routes,
	}

	log.Println("Server listening on port ", env.ServerPort)

	err = server.ListenAndServe()
	helper.ErrorPanic(err)
}
