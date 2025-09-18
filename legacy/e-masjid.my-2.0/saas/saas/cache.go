package saas

import (
	"github.com/go-saas/saas"
	sgorm "github.com/go-saas/saas/gorm"
)

var Cache *saas.Cache[string, *sgorm.DbWrap]

func InitCache() {
	Cache = saas.NewCache[string, *sgorm.DbWrap]()
	defer Cache.Flush()
}
