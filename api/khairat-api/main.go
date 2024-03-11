package main

import (
	"log"

	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/config"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/controller"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/service"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/utils"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("Starting server ...")

	env, err := utils.GetEnvironment()
	if err != nil {
		log.Fatalf("Error getting environment: %v", err)
	}

	db, err := config.DatabaseConnection(env)
	if err != nil {
		log.Fatalf("Error getting database connection: %v", err)
	}

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

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{env.AllowOrigins}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}

	gin.SetMode(gin.ReleaseMode)

	r := gin.Default()

	r.Use(cors.New(config))

	_ = controller.NewMemberController(r, memberService, env)
	_ = controller.NewTagController(r, tagRepository, env)
	_ = controller.NewDependentController(r, dependentRepository, env)
	_ = controller.NewPaymentHistoryController(r, paymentHistoryService, env)

	go func() {
		err = r.Run(":" + env.ServerPort)
		if err != nil {
			log.Fatal("Error starting the server:", err)
		}
	}()

	log.Println("Server listening on port ", env.ServerPort)

	select {} // Block indefinitely to keep the program running
}
