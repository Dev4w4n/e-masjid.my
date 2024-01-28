package main

import (
	"log"

	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/config"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/controller"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/repository"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-api/utils"

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

	cadanganRepository := repository.NewCadanganRepository(db)

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{env.AllowOrigins}
	config.AllowMethods = []string{"PUT", "GET"}

	gin.SetMode(gin.ReleaseMode)

	r := gin.Default()

	r.Use(cors.New(config))

	_ = controller.NewCadanganController(r, cadanganRepository, env)

	go func() {
		err := r.Run(":" + env.ServerPort)
		if err != nil {
			log.Fatal("Error starting the server:", err)
		}
	}()

	log.Println("Server listening on port ", env.ServerPort)

	select {} // Block indefinitely to keep the program running
}
