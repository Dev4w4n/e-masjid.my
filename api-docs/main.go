package main

import (
	"fmt"
	"net/http"

	_ "github.com/Dev4w4n/e-masjid.my/api-docs/docs"
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
	r.HandleFunc("/", HealthCheck).Methods("GET")
	r.PathPrefix("/api/").Handler(httpSwagger.Handler(
		httpSwagger.URL("http://localhost:8081/docs/doc.json"), //The url pointing to API definition"
		httpSwagger.URL("http://localhost:8082/docs/doc.json"), //The url pointing to API definition"
		httpSwagger.URL("http://localhost:8083/docs/doc.json"), //The url pointing to API definition"
	))
	http.ListenAndServe(":4000", r)

}

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	//specify status code
	w.WriteHeader(http.StatusOK)
  
 	//update response writer 
	fmt.Fprintln(w, "API is up and running")
	fmt.Fprintln(w, "Khairat-api : " + checkStatus("http://0.0.0.0:8081/docs/doc.json")) 
	fmt.Fprintln(w, "Tabung-api : " + checkStatus("http://0.0.0.0:8082/docs/doc.json")) 
	fmt.Fprintln(w, "Cadangan-api : " + checkStatus("http://0.0.0.0:8083/docs/doc.json")) 
}

func checkStatus(url string) string {
	response, err := http.Get(url)
	if err != nil {
	   return err.Error()
	}
	defer response.Body.Close()
	return response.Status
 }