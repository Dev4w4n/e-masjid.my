package config

import (
	"fmt"

	"github.com/Dev4w4n/e-masjid.my/api/tetapan-api-go/utils"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewDatabaseConnection(env utils.Environment) (*gorm.DB, error) {
	dbHost := env.DbHost
	dbPort := env.DbPort
	dbUser := env.DbUser
	dbPassword := env.DbPassword
	dbName := env.DbName

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		return nil, err
	}

	pgDb, err := db.DB()

	if err != nil {
		return nil, err
	}

	defer pgDb.Close()

	return db, nil
}
