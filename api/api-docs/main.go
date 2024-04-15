package main

import (
	"net/http"
	"os"

	_ "github.com/Dev4w4n/e-masjid.my/api/api-docs/docs"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/mux"

	httpSwagger "github.com/swaggo/http-swagger"
)

// http-swagger middleware
// @title Swagger e-masjid API
// @version 1.0
// @description This is a e-masjid API.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html
func main(){
	
	r := mux.NewRouter()
	r.PathPrefix("/api/").Handler(httpSwagger.Handler(
		httpSwagger.URL("http://localhost:8082/docs/doc.json"), //The url pointing to API definition"
	))
	http.ListenAndServe(":"+ os.Getenv("SERVER_PORT"), r)
}


func HealthCheck(c *gin.Context) {
	res := map[string]interface{}{
	   "data": "Server is up and running",
	}
 
	c.JSON(http.StatusOK, res)
 }