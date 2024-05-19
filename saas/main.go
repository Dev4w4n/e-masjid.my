package main

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/go-saas/saas"
	sgin "github.com/go-saas/saas/gin"
	"github.com/google/uuid"

	"net/http"

	"github.com/go-saas/saas/data"
	"github.com/go-saas/saas/seed"

	dbData "github.com/Dev4w4n/e-masjid.my/saas/data"
	"github.com/Dev4w4n/e-masjid.my/saas/model"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
)

const (
	sharedDsn = "host=postgres user=pgsql-saas password=pgsql-saas dbname=pgsql-saas port=5432 sslmode=disable TimeZone=UTC"
)

func main() {
	r := gin.Default()

	emasjidsaas.InitSaas(sharedDsn)
	r.Use(sgin.MultiTenancy(emasjidsaas.TenantStorage))

	//seed data into db
	seeder := seed.NewDefaultSeeder(dbData.NewMigrationSeeder(emasjidsaas.DbProvider), dbData.NewSeed(emasjidsaas.DbProvider, emasjidsaas.ConnStrGen))
	
	r.POST("/seed", func(c *gin.Context) {
		err := seeder.Seed(context.Background(), seed.AddHost(), seed.AddTenant("1"))
		if err != nil {
			panic(err)
		}
		c.JSON(200, gin.H{
			"message":  "ok",
		})
	})	

	//return current tenant
	r.GET("/tenant/current", func(c *gin.Context) {
		rCtx := c.Request.Context()
		tenantInfo, _ := saas.FromCurrentTenant(rCtx)
		trR := saas.FromTenantResolveRes(rCtx)
		c.JSON(200, gin.H{
			"tenantId":  tenantInfo.GetId(),
			"resolvers": trR.AppliedResolvers,
		})
	})

	r.GET("/posts", func(c *gin.Context) {
		db := emasjidsaas.DbProvider.Get(c.Request.Context(), "")
		var entities []model.Post
		if err := db.Model(&model.Post{}).Find(&entities).Error; err != nil {
			c.AbortWithError(500, err)
		} else {
			c.JSON(200, entities)
		}
	})

	// get all tenants
	r.GET("/tenants", func(c *gin.Context) {
		db := emasjidsaas.DbProvider.Get(c.Request.Context(), "")
		var entities []model.Tenant
		if err := db.Model(&model.Tenant{}).Find(&entities).Error; err != nil {
			c.AbortWithError(500, err)
		} else {
			c.JSON(200, entities)
		}
	})

	// search tenant by id
	r.GET("/tenant/:name", func(c *gin.Context) {
		db := emasjidsaas.DbProvider.Get(c.Request.Context(), "")
		var entity model.Tenant
		if err := db.Model(&model.Tenant{}).Where("name = ?", c.Param("name")).First(&entity).Error; err != nil {
			c.AbortWithError(500, err)
		} else {
			c.JSON(200, entity)
		}
	})

	r.POST("/tenant", func(c *gin.Context) {
		type CreateTenant struct {
			Name             string `form:"name" json:"name" binding:"required"`
			Namespace        string `form:"namespace" json:"namespace" binding:"required"`
			ManagerRole      string `form:"manager_role" json:"manager_role" binding:"required"`
			UserRole         string `form:"user_role" json:"user_role" binding:"required"`
			KeycloakClientId string `form:"keycloak_client_id" json:"keycloak_client_id" binding:"required"`
			KeycloakServer   string `form:"keycloak_server" json:"keycloak_server" binding:"required"`
			KeycloakJwksUrl  string `form:"keycloak_jwks_url" json:"keycloak_jwks_url" binding:"required"`
			SeparateDb       bool   `form:"separate_db" json:"separate_db" binding:"required"`
		}
		var json CreateTenant
		if err := c.ShouldBindJSON(&json); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		ctx := c.Request.Context()
		//change to host side
		ctx = saas.NewCurrentTenant(ctx, "", "")
		db := emasjidsaas.DbProvider.Get(ctx, "")
		t := &model.Tenant{
			ID:               uuid.New().String(),
			Name:             json.Name,
			Namespace:        json.Namespace,
			ManagerRole:      json.ManagerRole,
			UserRole:         json.UserRole,
			KeycloakClientId: json.KeycloakClientId,
			KeycloakServer:   json.KeycloakServer,
			KeycloakJwksUrl:  json.KeycloakJwksUrl,
		}
		if json.SeparateDb {
			t3Conn, _ := emasjidsaas.ConnStrGen.Gen(ctx, saas.NewBasicTenantInfo(t.ID, t.Name))
			t.Conn = []model.TenantConn{
				{Key: data.Default, Value: t3Conn}, // use tenant3.db
			}
		}
		err := db.Model(t).Create(t).Error
		if err != nil {
			c.AbortWithError(500, err)
			return
		}
		err = seeder.Seed(context.Background(), seed.AddTenant(t.ID))
		if err != nil {
			panic(err)
		}

	})

	r.Run(":8090") // listen and serve on 0.0.0.0:8090 (for windows "localhost:8090")
}
