package main

import (
	"log"
	"net/http"
	"os"

	"github.com/Dev4w4n/e-masjid.my/api/core/config"
	"github.com/Dev4w4n/e-masjid.my/api/core/env"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/controller"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/router"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/service"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/utils"

	_ "github.com/Dev4w4n/e-masjid.my/api/khairat-api/docs"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

//	@title			Khairat Service API
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

	// Repository
	tagRepository := repository.NewTagRepository(db)
	memberRepository := repository.NewMemberRepository(db)
	dependentRepository := repository.NewDependentRepository(db)
	memberTagRepository := repository.NewMemberTagRepository(db)
	paymentHistoryRepository := repository.NewPaymentHistoryRepository(db)
	personRepository := repository.NewPersonRepository(db)

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
	config.AllowOrigins = []string{env.AllowOrigins,"http://localhost:4000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}

	// Router
	gin.SetMode(gin.ReleaseMode)
	_router := gin.Default()
	_router.Use(cors.New(config))

	// enable swagger for dev env
	isLocalEnv := os.Getenv("GO_ENV")
	if (isLocalEnv == "local" || isLocalEnv == "dev") {
		_router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	var routes *gin.Engine = _router
	routes = router.NewMemberRouter(memberController,routes)
	routes = router.NewTagRouter(tagController,routes)
	routes = router.NewDependentRouter(dependentController,routes)
	routes = router.NewPaymentHistoryRouter(paymentHistoryController,routes)

	server := &http.Server{
		Addr:    ":" + env.ServerPort,
		Handler: routes,
	}
	
	log.Println("Server listening on port ", env.ServerPort)

	err = server.ListenAndServe()
	utils.ErrorPanic(err)

}
