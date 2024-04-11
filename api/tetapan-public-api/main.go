package main

import (
	"log"
	"net/http"

	"github.com/Dev4w4n/e-masjid.my/api/core/utils"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/config"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/controller"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-public-api/repository"

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

	tetapanRepository := repository.NewTetapanRepository(db)

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{env.AllowOrigins}
	config.AllowMethods = []string{"GET", "POST", "DELETE"}

	gin.SetMode(gin.ReleaseMode)

	r := gin.Default()

	r.Use(cors.New(config))
	r.Use(controllerMiddleware())

	_ = controller.NewTetapanController(r, tetapanRepository, env)

	go func() {
		err = r.Run(":" + env.ServerPort)
		if err != nil {
			log.Fatal("Error starting the server:", err)
		}
	}()

	log.Println("Server listening on port ", env.ServerPort)

	select {} // Block indefinitely to keep the program running
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
