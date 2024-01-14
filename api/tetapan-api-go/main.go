package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"gopkg.in/yaml.v3"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Config struct {
	Server struct {
		Port string `yaml:"port"`
	} `yaml:"server"`
	Database struct {
		Host     string `yaml:"host"`
		Port     int    `yaml:"port"`
		User     string `yaml:"user"`
		Password string `yaml:"password"`
		Name     string `yaml:"name"`
	} `yaml:"database"`
}

type tetapan struct {
	kunci string
	nilai string
}

func main() {
	var props Config

	yamlFile, err := os.ReadFile("config.yaml")

	if err != nil {
		log.Fatal(err)
	}

	err = yaml.Unmarshal(yamlFile, &props)

	if err != nil {
		log.Fatal(err)
	}

	dbHost := props.Database.Host
	dbPort := props.Database.Port
	dbUser := props.Database.User
	dbPassword := props.Database.Password
	dbName := props.Database.Name

	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal(err)
	}

	pgDb, err := db.DB()

	if err != nil {
		log.Fatal(err)
	}

	defer pgDb.Close()

	db.AutoMigrate(&tetapan{})

	router := mux.NewRouter()

	router.HandleFunc("/tetapan", findAll).Methods("GET")
	router.HandleFunc("/tetapan/{kunci}", findByKunci).Methods("GET")
	router.HandleFunc("/tetapan", save).Methods("POST")
	router.HandleFunc("/tetapan/senarai", saveAll).Methods("POST")

	log.Fatal(http.ListenAndServe(":"+props.Server.Port, router))
}

func findAll(w http.ResponseWriter, r *http.Request) {
	log.Println("findAll")
}

func findByKunci(w http.ResponseWriter, r *http.Request) {
	log.Println("findByKunci")
}

func save(w http.ResponseWriter, r *http.Request) {
	log.Println("save")
}

func saveAll(w http.ResponseWriter, r *http.Request) {
	log.Println("saveAll")
}
