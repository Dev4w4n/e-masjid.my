package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	"github.com/Dev4w4n/e-masjid.my/api/core/security"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/controller"
	_ "github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/docs"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/helper"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/router"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	sgin "github.com/go-saas/saas/gin"
	shttp "github.com/go-saas/saas/http"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title			Tetapan Public Service API
// @version		1.0
// @description	A Tetapan Public service API in Go using Gin framework
func main() {
	log.Println("Starting server ...")

	env, err := env.GetEnvironment()
	if err != nil {
		log.Fatalf("Error getting environment: %v", err)
	}

	tetapanRepository := repository.NewTetapanRepository()
	tetapanController := controller.NewTetapanController(tetapanRepository)

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowMethods = []string{"GET", "POST", "DELETE"}
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
	isSaasDisabled := os.Getenv("DISABLE_SAAS")
	if (isLocalEnv == "docker" && isSaasDisabled != "true") {
		config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
		// enable multi tenancy for *.e-masjid.my
		_router.Use(sgin.MultiTenancy(emasjidsaas.TenantStorage,
			sgin.WithMultiTenancyOption(shttp.NewWebMultiTenancyOption("", "([-a-z0-9]+)\\.e-masjid\\.my"))))
	} else {
		config.AllowHeaders = []string{"*"}
		// enable swagger for dev env
		_router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
		// enable multi tenancy for dev
		_router.Use(sgin.MultiTenancy(emasjidsaas.TenantStorage))
	}

	_router.Use(cors.New(config))
	_router.Use(controllerMiddleware())

	var routes *gin.Engine = _router
	routes = router.NewTetapanPublicRouter(tetapanController, routes, env)

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
