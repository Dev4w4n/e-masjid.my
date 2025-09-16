package saas

import (
	"context"
	"database/sql"

	"github.com/go-saas/saas"
	sgorm "github.com/go-saas/saas/gorm"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewClientProvider() saas.ClientProvider[*gorm.DB] {
	return sgorm.ClientProviderFunc(func(ctx context.Context, s string) (*gorm.DB, error) {
		client, _, err := Cache.GetOrSet(s, func() (*sgorm.DbWrap, error) {
			if EnsureDbExist != nil {
				if err := EnsureDbExist(s); err != nil {
					return nil, err
				}
			}
			var client *gorm.DB
			var err error
			db, err := sql.Open("pgx", s)
			if err != nil {
				return nil, err
			}

			client, err = gorm.Open(postgres.New(postgres.Config{
				Conn: db,
			}))

			return sgorm.NewDbWrap(client), err
		})

		if err != nil {
			return nil, err
		}
		return client.WithContext(ctx).Debug(), err
	})
}
