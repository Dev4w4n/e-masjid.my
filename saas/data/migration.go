package data

import (
	"context"

	model1 "github.com/Dev4w4n/e-masjid.my/api/cadangan-api/model"
	model2 "github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	model4 "github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	model3 "github.com/Dev4w4n/e-masjid.my/api/tetapan-api/model"
	"github.com/Dev4w4n/e-masjid.my/saas/model"
	"github.com/go-saas/saas/gorm"
	"github.com/go-saas/saas/seed"
)

type MigrationSeeder struct {
	dbProvider gorm.DbProvider
}

func NewMigrationSeeder(dbProvider gorm.DbProvider) *MigrationSeeder {
	return &MigrationSeeder{dbProvider: dbProvider}
}

func (m *MigrationSeeder) Seed(ctx context.Context, sCtx *seed.Context) error {
	db := m.dbProvider.Get(ctx, "")
	if sCtx.TenantId == "" {
		//host add tenant database
		err := db.AutoMigrate(&model.Tenant{}, &model.TenantConn{})
		if err != nil {
			return err
		}
	}
	err := db.AutoMigrate(&model.Post{})
	if err != nil {
		return err
	}

	// add e-masjid.my tables
	err = db.AutoMigrate(
		&model1.Cadangan{},
		&model1.CadanganType{},
		&model2.Dependent{},
		&model2.Member{},
		&model2.MemberTag{},
		&model2.Tag{},
		&model2.Person{},
		&model2.PaymentHistory{},
		&model3.Tetapan{},
		&model3.TetapanType{},
		&model4.Tabung{},
		&model4.TabungType{},
		&model4.Kutipan{},
	)
	if err != nil {
		return err
	}

	return nil
}
