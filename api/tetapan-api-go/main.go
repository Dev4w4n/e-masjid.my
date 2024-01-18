package main

import (
	"log"
	"net/http"

	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api-go/config"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api-go/controller"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api-go/repository"
	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api-go/utils"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("Starting server ...")

	env, err := utils.GetEnvironment()
	if err != nil {
		log.Fatalf("Error getting environment: %v", err)
	}

	db, err := config.NewDatabaseConnection(env)
	if err != nil {
		log.Fatalf("Error getting database connection: %v", err)
	}

	tetapanRepository := repository.NewTetapanRepository(db)

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{env.AllowOrigins}
	config.AllowMethods = []string{"POST"}

	gin.SetMode(gin.ReleaseMode)

	r := gin.Default()

	r.Use(cors.New(config))
	r.Use(controllerMiddleware())

	_ = controller.NewTetapanController(r, tetapanRepository)

	err = r.Run(":" + env.ServerPort)
	if err != nil {
		log.Fatal("Error starting the server:", err)
	}
}

// Strictly allow from allowedOrigin
func controllerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if the request origin is allowed
		allowedOrigin := ""
		origin := c.GetHeader("Origin")
		if origin != allowedOrigin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
			c.Abort()
			return
		}
	}
}
