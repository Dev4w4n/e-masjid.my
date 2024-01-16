package main

import (
	"emasjid/cadangan-public-api/repository"
	"emasjid/cadangan-public-api/utils"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	log.Println("Starting server ...")
	env, err1 := utils.GetEnvironment()
	if err1 != nil {
		log.Fatalf("Error getting environment: %v", err1)
	}

	repository.InitDB(env.DbHost, env.DbPort, env.DbUser, env.DbPassword, env.DbName)

	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{env.AllowOrigins}
	config.AllowMethods = []string{"POST"}

	r.Use(cors.New(config))
	r.Use(controllerMiddleware())

	r.POST(env.DeployURL+"cadangan", repository.CreateCadanganHandler)

	err := r.Run(":" + env.ServerPort)
	if err != nil {
		log.Fatal("Error starting the server:", err)
	}
}

// repository.go

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
