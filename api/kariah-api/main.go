package main

import (
	"fmt"
	"log"
	"os"

	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	"github.com/Dev4w4n/e-masjid.my/api/core/security"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/helper"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	sgin "github.com/go-saas/saas/gin"
	shttp "github.com/go-saas/saas/http"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	log.Println("Starting server ...")

	env, err := env.GetEnvironment()
	if err != nil {
		log.Fatalf("Error getting environment: %v", err)
	}

	// cadanganRepository := repository.NewCadanganRepository()
	// cadanganController := controller.NewCadanganController(cadanganRepository)

	// CORS configuration
	config := cors.DefaultConfig()
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

	isLocalEnv := os.Getenv("GO_ENV")
	if isLocalEnv == "local" || isLocalEnv == "dev" {
		// enable cors for *
		config.AllowHeaders = []string{"*"}
		// enable swagger for dev env
		_router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
		// enable multi tenancy for dev
		_router.Use(sgin.MultiTenancy(emasjidsaas.TenantStorage))
	} else if isLocalEnv == "prod" {
		config.AllowCredentials = true
		config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
		// enable keycloak for prod env
		_router.Use(security.AuthMiddleware)
		// enable multi tenancy for *.e-masjid.my
		_router.Use(sgin.MultiTenancy(emasjidsaas.TenantStorage,
			sgin.WithMultiTenancyOption(shttp.NewWebMultiTenancyOption("", "([-a-z0-9]+)\\.e-masjid\\.my"))))
	}

	// enable cors
	_router.Use(cors.New(config))
	// routes := router.NewCadanganRouter(cadanganController, _router, env)

	// server := &http.Server{
	// 	Addr:    ":" + env.ServerPort,
	// 	Handler: routes,
	// }

	log.Println("Server listening on port ", env.ServerPort)

	// err = server.ListenAndServe()
	helper.ErrorPanic(err)
}
