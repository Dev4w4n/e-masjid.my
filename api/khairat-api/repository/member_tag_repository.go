package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-gonic/gin"
)

type MemberTagRepository interface {
	DeleteByMemberId(ctx *gin.Context, memberId int64) error
	Save(ctx *gin.Context, memberTag model.MemberTag) (model.MemberTag, error)
}

type MemberTagRepositoryImpl struct {
}

func NewMemberTagRepository() MemberTagRepository {
	return &MemberTagRepositoryImpl{}
}

// DeleteByMemberId implements MemberTagRepository.
func (repo *MemberTagRepositoryImpl) DeleteByMemberId(ctx *gin.Context, memberId int64) error {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Where("member_id = ?", memberId).Delete(&model.MemberTag{})

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// Save implements MemberTagRepository.
func (repo *MemberTagRepositoryImpl) Save(ctx *gin.Context, memberTag model.MemberTag) (model.MemberTag, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Save(&memberTag)

	if result.Error != nil {
		return model.MemberTag{}, result.Error
	}

	return memberTag, nil
}
