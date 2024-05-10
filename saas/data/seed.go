package data

import (
	"context"
	"fmt"

	"github.com/go-saas/saas"

	"github.com/go-saas/saas/gorm"
	"github.com/go-saas/saas/seed"
	gorm2 "gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/Dev4w4n/e-masjid.my/saas/model"
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

	// if sCtx.TenantId == "2" {
	// 	entities := []model.Post{
	// 		{
	// 			Model:       gorm2.Model{ID: 3},
	// 			Title:       fmt.Sprintf("Tenant %s Post 1", sCtx.TenantId),
	// 			Description: fmt.Sprintf("Hello from tenant %s. There are two posts in this tenant. This is post 1", sCtx.TenantId),
	// 		},
	// 		{
	// 			Model:       gorm2.Model{ID: 4},
	// 			Title:       fmt.Sprintf("Tenant %s Post 2", sCtx.TenantId),
	// 			Description: fmt.Sprintf("Hello from tenant %s. There are two posts in this tenant. This is post 2", sCtx.TenantId),
	// 		},
	// 	}
	// 	if err := createPosts(db, entities); err != nil {
	// 		return err
	// 	}
	// }

	// if sCtx.TenantId == "3" {
	// 	entities := []model.Post{
	// 		{
	// 			Model:       gorm2.Model{ID: 5},
	// 			Title:       fmt.Sprintf("Tenant %s Post 1", sCtx.TenantId),
	// 			Description: fmt.Sprintf("Hello from tenant %s. There are there posts in this tenant. This is post 1", sCtx.TenantId),
	// 		},
	// 		{
	// 			Model:       gorm2.Model{ID: 6},
	// 			Title:       fmt.Sprintf("Tenant %s Post 2", sCtx.TenantId),
	// 			Description: fmt.Sprintf("Hello from tenant %s. There are there posts in this tenant. This is post 2", sCtx.TenantId),
	// 		},
	// 		{
	// 			Model:       gorm2.Model{ID: 7},
	// 			Title:       fmt.Sprintf("Tenant %s Post 2", sCtx.TenantId),
	// 			Description: fmt.Sprintf("Hello from tenant %s. There are there posts in this tenant. This is post 3", sCtx.TenantId),
	// 		},
	// 	}
	// 	if err := createPosts(db, entities); err != nil {
	// 		return err
	// 	}
	// }
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
