package saas

import (
	"context"
	"errors"

	"github.com/go-saas/saas"

	"github.com/go-saas/saas/data"
	sgorm "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"

	"github.com/Dev4w4n/e-masjid.my/saas/model"
	"github.com/Dev4w4n/e-masjid.my/saas/utils"
)

type TenantStore struct {
	DbProvider sgorm.DbProvider
}

var _ saas.TenantStore = (*TenantStore)(nil)
var ConnStrGen saas.ConnStrGenerator
var ConnStrResolver data.ConnStrResolver
var TenantStorage *TenantStore

func InitSaas(sharedDsn string) {
	InitCache()
	InitConnStrResolver(sharedDsn)
	InitConnStrGenerator(sharedDsn)
	TenantStorage = &TenantStore{
		DbProvider: sgorm.NewDbProvider(ConnStrResolver, NewClientProvider()),
	}
	InitDbProvider()
}

func InitConnStrResolver(sharedDsn string) {
	conn := make(data.ConnStrings, 1)
	//default database
	conn.SetDefault(sharedDsn)
	ConnStrResolver = conn
}

func InitConnStrGenerator(sharedDsn string) {
	suffix := "%s"
	modifiedDSN := utils.AddSuffixToDBName(sharedDsn, suffix)
	ConnStrGen = saas.NewConnStrGenerator(modifiedDSN)
}

func (t *TenantStore) GetByNameOrId(ctx context.Context, nameOrId string) (*saas.TenantConfig, error) {
	//change to host side
	ctx = saas.NewCurrentTenant(ctx, "", "")
	db := t.DbProvider.Get(ctx, "")
	var tenant model.Tenant
	err := db.Model(&model.Tenant{}).Preload("Conn").Where("id = ? OR name = ?", nameOrId, nameOrId).First(&tenant).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, saas.ErrTenantNotFound
		} else {
			return nil, err
		}
	}
	ret := saas.NewTenantConfig(tenant.ID, tenant.Name, tenant.Namespace, "")
	for _, conn := range tenant.Conn {
		ret.Conn[conn.Key] = conn.Value
	}
	return ret, nil
}
