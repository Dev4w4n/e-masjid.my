package repository

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"emasjid/cadangan-public-api/entity"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

var db *sqlx.DB

func InitDB(dbHost, dbPort, dbUser, dbPassword, dbName string) {
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

	log.Println("Connected to the database")
}

func createCadangan(cadangan *entity.Cadangan) error {
	cadangan.CreateDate = time.Now().Unix()

	query := "INSERT INTO cadangan (cadangan_types_id, cadangan_text, tindakan_text, cadangan_nama, cadangan_email, cadangan_phone, is_open, score, create_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id"

	stmt, err := db.Preparex(query)
	if err != nil {
		log.Println("Error preparing SQL statement:", err)
		return err
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
		return err
	}

	log.Printf("New Cadangan created successfully. ID: %d\n", cadangan.ID)
	return nil
}

func CreateCadanganHandler(c *gin.Context) {
	var request struct {
		CadanganType  entity.CadanganType `json:"cadanganType"`
		CadanganText  string              `json:"cadanganText"`
		TindakanText  string              `json:"tindakanText"`
		CadanganNama  string              `json:"cadanganNama"`
		CadanganEmail string              `json:"cadanganEmail"`
		CadanganPhone string              `json:"cadanganPhone"`
		IsOpen        bool                `json:"isOpen"`
		Score         int                 `json:"score"`
		CreateDate    int64               `json:"createDate"`
	}
	// var request = entity.Cadangan{}

	if err := c.ShouldBindJSON(&request); err != nil {
		log.Println("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cadangan := entity.Cadangan{
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

	if err := createCadangan(&cadangan); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusCreated, cadangan)
}
