package data

import (
	"context"

	"github.com/Dev4w4n/e-masjid.my/saas/model"
	"github.com/go-saas/saas/gorm"
	"github.com/go-saas/saas/seed"

	cadanganmodel "github.com/Dev4w4n/e-masjid.my/api/cadangan-api/model"
	khairatmodel "github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	tabungmodel "github.com/Dev4w4n/e-masjid.my/api/tabung-api/model"
	tetapanmodel "github.com/Dev4w4n/e-masjid.my/api/tetapan-api/model"
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
	err := db.AutoMigrate(&model.Post{}, 
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
		&tetapanmodel.TetapanType{})
	if err != nil {
		return err
	}

	return nil
}
