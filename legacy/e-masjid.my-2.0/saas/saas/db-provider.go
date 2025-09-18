package saas

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/Dev4w4n/e-masjid.my/saas/utils"
	"github.com/go-saas/saas"
	sgorm "github.com/go-saas/saas/gorm"
)

var EnsureDbExist = func(s string) error {
	dbname, err := utils.ParseDBNameFromPostgresDSN(s)
	if err != nil {
		return err
	}

	noDbDsn, err := utils.RemoveDBNameFromPostgresDSN(s)
	if err != nil {
		return err
	}

	//open without db name
	db, err := sql.Open("pgx", noDbDsn)
	if err != nil {
		return err
	}

	var exists bool
	err = db.QueryRowContext(context.Background(), "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1)", dbname).Scan(&exists)
	if err != nil {
		return err
	}

	// If the database doesn't exist, create it
	if !exists {
		_, err := db.ExecContext(context.Background(), fmt.Sprintf("CREATE DATABASE \"%s\"", dbname))
		if err != nil {
			return err
		}
	}

	return db.Close()
}

func InitDbProvider() {
	mr := saas.NewMultiTenancyConnStrResolver(TenantStorage, ConnStrResolver)

	//tenant dbProvider use connection string from tenant store
	DbProvider = sgorm.NewDbProvider(mr, NewClientProvider())
}

var DbProvider sgorm.DbProvider
