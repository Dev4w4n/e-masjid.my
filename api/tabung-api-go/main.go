package main

import (
	"log"

	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/config"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/controller"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/service"
	"github.com/Dev4w4n/e-masjid.my/api/tabung-api/utils"

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

	tabungTypeRepository := repository.NewTabungTypeRepository(db)

	tabungTypeService := service.NewTabungTypeService(tabungTypeRepository)

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{env.AllowOrigins}
	config.AllowMethods = []string{"GET", "POST", "DELETE"}

	gin.SetMode(gin.ReleaseMode)

	r := gin.Default()

	r.Use(cors.New(config))

	_ = controller.NewTabungTypeController(r, tabungTypeService, env)

	go func() {
		err = r.Run(":" + env.ServerPort)
		if err != nil {
			log.Fatal("Error starting the server:", err)
		}
	}()

	log.Println("Server listening on port ", env.ServerPort)

	select {} // Block indefinitely to keep the program running
}
