package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/controller"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/router"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/service"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/utils"

	_ "github.com/Dev4w4n/e-masjid.my/api/khairat-api/docs"

	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	sgin "github.com/go-saas/saas/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title			Khairat Service API
// @version		1.0
// @description	A Tabung service API in Go using Gin framework
func main() {
	log.Println("Starting server ...")

	env, err := env.GetEnvironment()
	if err != nil {
		log.Fatalf("Error getting environment: %v", err)
	}

	// Repository
	tagRepository := repository.NewTagRepository()
	memberRepository := repository.NewMemberRepository()
	dependentRepository := repository.NewDependentRepository()
	memberTagRepository := repository.NewMemberTagRepository()
	paymentHistoryRepository := repository.NewPaymentHistoryRepository()
	personRepository := repository.NewPersonRepository()

	memberService := service.NewMemberService(memberRepository,
		personRepository, dependentRepository,
		memberTagRepository, paymentHistoryRepository)

	paymentHistoryService := service.NewPaymentHistoryService(paymentHistoryRepository)

	// Controller
	memberController := controller.NewMemberController(memberService)
	tagController := controller.NewTagController(tagRepository)
	dependentController := controller.NewDependentController(dependentRepository)
	paymentHistoryController := controller.NewPaymentHistoryController(paymentHistoryService)

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowHeaders = []string{"*"}
	config.AllowCredentials = true
	config.MaxAge = 3600
	config.AllowOrigins = []string{env.AllowOrigins}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}

	// Router
	gin.SetMode(gin.ReleaseMode)

	sharedDsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		env.DbHost, env.DbUser, env.DbPassword, env.DbName, env.DbPort)

	emasjidsaas.InitSaas(sharedDsn)

	_router := gin.Default()
	_router.Use(cors.New(config))
	_router.Use(sgin.MultiTenancy(emasjidsaas.TenantStorage))

	// enable swagger for dev env
	isLocalEnv := os.Getenv("GO_ENV")
	if isLocalEnv == "local" || isLocalEnv == "dev" {
		_router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	var routes *gin.Engine = _router
	routes = router.NewMemberRouter(memberController, routes, env)
	routes = router.NewTagRouter(tagController, routes, env)
	routes = router.NewDependentRouter(dependentController, routes, env)
	routes = router.NewPaymentHistoryRouter(paymentHistoryController, routes, env)

	server := &http.Server{
		Addr:    ":" + env.ServerPort,
		Handler: routes,
	}

	log.Println("Server listening on port ", env.ServerPort)

	err = server.ListenAndServe()
	utils.ErrorPanic(err)

}
