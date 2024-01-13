package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var db *sqlx.DB
var validate = validator.New()

var dbHost string
var dbPort string
var dbUser string
var dbPassword string
var dbName string

type CadanganType struct {
	ID   int    `db:"id" json:"id" validate:"required"`
	Name string `db:"name" json:"name"`
}

type Cadangan struct {
	ID            int          `db:"id" json:"id"`
	CadanganType  CadanganType `db:"cadangan_type" json:"cadanganType"`
	CadanganText  string       `db:"cadangan_text" json:"cadanganText" validate:"required"`
	TindakanText  string       `db:"tindakan_text" json:"tindakanText"`
	CadanganNama  string       `db:"cadangan_nama" json:"cadanganNama"`
	CadanganEmail string       `db:"cadangan_email" json:"cadanganEmail"`
	CadanganPhone string       `db:"cadangan_phone" json:"cadanganPhone"`
	IsOpen        bool         `db:"is_open" json:"isOpen"`
	Score         int          `db:"score" json:"score"`
	CreateDate    int64        `db:"create_date" json:"createDate"`
}

func main() {
	initEnv()
	initDB()
	defer db.Close()

	r := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"POST"}

	r.Use(cors.New(config))

	r.POST("/cadangan", createCadangan)

	err := r.Run(":8080")
	if err != nil {
		log.Fatal("Error starting the server:", err)
	}
}

func initEnv() {
	env := os.Getenv("GO_ENV")
	if env == "" {
		env = "local"
	}

	envFile := ".env." + env
	if err := godotenv.Load(envFile); err != nil {
		log.Fatalf("Error loading %s file: %s", envFile, err)
	}

	dbHost = os.Getenv("DB_HOST")
	dbPort = os.Getenv("DB_PORT")
	dbUser = os.Getenv("DB_USER")
	dbPassword = os.Getenv("DB_PASSWORD")
	dbName = os.Getenv("DB_NAME")
}

func initDB() {
	var err error
	db, err = sqlx.Open("postgres",
		fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
			dbHost, dbPort, dbUser, dbPassword, dbName))
	if err != nil {
		log.Fatal("Error connecting to the database:", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatal("Error pinging the database:", err)
	}
}

func createCadangan(c *gin.Context) {
	var request struct {
		CadanganType  CadanganType `json:"cadanganType" validate:"required"`
		CadanganText  string       `json:"cadanganText" validate:"required"`
		TindakanText  string       `json:"tindakanText"`
		CadanganNama  string       `json:"cadanganNama"`
		CadanganEmail string       `json:"cadanganEmail" validate:"email"`
		CadanganPhone string       `json:"cadanganPhone" validate:"numeric"`
		IsOpen        bool         `json:"isOpen"`
		Score         int          `json:"score"`
		CreateDate    int64        `json:"createDate"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		log.Println("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate the request
	if err := validate.Struct(request); err != nil {
		log.Println("Validation error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data"})
		return
	}

	cadangan := Cadangan{
		CadanganType:  request.CadanganType,
		CadanganText:  request.CadanganText,
		TindakanText:  request.TindakanText,
		CadanganNama:  request.CadanganNama,
		CadanganEmail: request.CadanganEmail,
		CadanganPhone: request.CadanganPhone,
		IsOpen:        request.IsOpen,
		Score:         request.Score,
		CreateDate:    request.CreateDate,
	}

	cadangan.CreateDate = time.Now().Unix()

	query := "INSERT INTO cadangan (cadangan_types_id, cadangan_text, tindakan_text, cadangan_nama, cadangan_email, cadangan_phone, is_open, score, create_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id"

	stmt, err := db.Preparex(query)
	if err != nil {
		log.Println("Error preparing SQL statement:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}
	defer stmt.Close()

	err = stmt.QueryRow(
		cadangan.CadanganType.ID,
		cadangan.CadanganText,
		cadangan.TindakanText,
		cadangan.CadanganNama,
		cadangan.CadanganEmail,
		cadangan.CadanganPhone,
		cadangan.IsOpen,
		cadangan.Score,
		cadangan.CreateDate,
	).Scan(&cadangan.ID)

	if err != nil {
		log.Println("Error executing SQL query:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	log.Printf("New Cadangan created successfully. ID: %d\n", cadangan.ID)
	c.JSON(http.StatusCreated, cadangan)
}
