package data

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/go-saas/saas"

	"github.com/go-saas/saas/gorm"
	"github.com/go-saas/saas/seed"
	gorm2 "gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/Dev4w4n/e-masjid.my/saas/model"

	cadanganmodel "github.com/Dev4w4n/e-masjid.my/api/cadangan-api/model"
	coremodel "github.com/Dev4w4n/e-masjid.my/api/core/model"
	khairatmodel "github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	tabungmodel "github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	tetapanmodel "github.com/Dev4w4n/e-masjid.my/api/tetapan-api/model"
)

type Seed struct {
	dbProvider gorm.DbProvider
	connStrGen saas.ConnStrGenerator
}

func NewSeed(dbProvider gorm.DbProvider, connStrGen saas.ConnStrGenerator) *Seed {
	return &Seed{dbProvider: dbProvider, connStrGen: connStrGen}
}

func (s *Seed) Seed(ctx context.Context, sCtx *seed.Context) error {
	db := s.dbProvider.Get(ctx, "")

	if sCtx.TenantId == "" {
		//init host
		log.Println("Initializing host.")
		err := db.Model(&model.Tenant{}).Session(&gorm2.Session{FullSaveAssociations: true}).Clauses(clause.OnConflict{UpdateAll: true}).CreateInBatches([]model.Tenant{
			{ID: "1", Name: "Host"}}, 10).Error
		if err != nil {
			return err
		}
		entities := []model.Post{
			{
				Model:       gorm2.Model{ID: 1},
				Title:       fmt.Sprintf("Host Side"),
				Description: fmt.Sprintf("Init Host"),
			},
		}
		if err := createPosts(db, entities); err != nil {
			return err
		}
	}

	if sCtx.TenantId == "1" {
		entities := []model.Post{
			{
				Model:       gorm2.Model{ID: 2},
				Title:       fmt.Sprintf("Tenant %s Post 1", sCtx.TenantId),
				Description: fmt.Sprintf("Hello from tenant %s. There are one post in this tenant. This is post 1", sCtx.TenantId),
			},
		}
		if err := createPosts(db, entities); err != nil {
			return err
		}
	}

	// if its a tenant then init the database
	if sCtx.TenantId != "" {
		log.Println("Executing Sql Files.")
		err := executeSqlFiles(db, sCtx.TenantId)
		if err != nil {
			return err
		}
	}

	return nil
}

func createPosts(db *gorm2.DB, entities []model.Post) error {
	for _, entity := range entities {
		err := db.Clauses(clause.OnConflict{
			UpdateAll: true,
		}).Model(&model.Post{}).Create(&entity).Error
		if err != nil {
			return err
		}
	}
	return nil
}

func executeSqlFiles(db *gorm2.DB, tenantId string) error {
	// List .sql files in a directory
	// Update the pattern to match your file naming convention
	sqlFiles, err := filepath.Glob("/app/*.sql")
	if err != nil {
		panic(err)
	}

	log.Println("Sorting files.")
	// Sort files by name
	sort.Strings(sqlFiles)

	log.Println("Files count: ", sqlFiles)
	// Loop through each .sql file
	for _, sqlFile := range sqlFiles {
		log.Println("Processing file: ", sqlFile)
		// Read SQL file
		sqlBytes, err := os.ReadFile(sqlFile)
		if err != nil {
			panic(err)
		}

		// Split SQL statements
		sqlStatements := strings.Split(string(sqlBytes), ";")

		// Execute SQL statements
		for _, sqlStatement := range sqlStatements {
			sqlStatement = strings.TrimSpace(sqlStatement)
			if sqlStatement == "" {
				continue
			}
			err := db.Exec(sqlStatement).Error
			if err != nil {
				panic(err)
			}
		}
	}

	if tenantId != "1" { // if not localhost
		models := []interface{}{
			&cadanganmodel.Cadangan{},
			&cadanganmodel.CadanganType{},
			&khairatmodel.Dependent{},
			&khairatmodel.Member{},
			&khairatmodel.MemberTag{},
			&khairatmodel.PaymentHistory{},
			&khairatmodel.Person{},
			&khairatmodel.Tag{},
			&tabungmodel.Tabung{},
			&tabungmodel.Kutipan{},
			&tabungmodel.TabungType{},
			&tetapanmodel.Tetapan{},
			&tetapanmodel.TetapanType{},
			&coremodel.KariahMember{},
			&coremodel.KariahDependent{},
			&coremodel.KariahMemberAssignedType{},
		}

		// Loop through each model

		log.Println("Updating tenant_id in tables.")
		for _, model := range models {
			tableName, err := getTableName(db, model)
			log.Println("Table name: ", tableName)
			if err != nil {
				return fmt.Errorf("failed to get table name for model %T: %w", model, err)
			}

			var count int64
			// Manually construct the count query
			countQuery := fmt.Sprintf("SELECT count(*) FROM %s WHERE tenant_id IS NULL", tableName)

			if err := db.Raw(countQuery).Scan(&count).Error; err != nil {
				return fmt.Errorf("failed to count rows in table %s: %w", tableName, err)
			}

			// If there are rows, update the tenant_id
			log.Println("Table row count: ", count)
			if count > 0 {
				log.Println("Updating tenant_id in table ", tableName)
				if err := db.Table(tableName).Where("tenant_id IS NULL").Update("tenant_id", tenantId).Error; err != nil {
					return fmt.Errorf("failed to update tenant_id in table %s: %w", tableName, err)
				}
			}
		}
	}

	log.Println("Initialization complete.")

	return nil
}

func getTableName(db *gorm2.DB, model interface{}) (string, error) {
	stmt := &gorm2.Statement{DB: db}
	if err := stmt.Parse(model); err != nil {
		return "", err
	}
	return stmt.Table, nil
}
