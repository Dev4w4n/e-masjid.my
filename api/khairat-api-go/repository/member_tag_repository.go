package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"gorm.io/gorm"
)

type MemberTagRepository interface {
	DeleteByMemberId(memberId int) error
}

type MemberTagRepositoryImpl struct {
	Db *gorm.DB
}

func NewMemberTagRepository(db *gorm.DB) MemberTagRepository {
	db.AutoMigrate(&model.MemberTag{})

	return &MemberTagRepositoryImpl{Db: db}
}

// DeleteByMemberId implements MemberTagRepository.
func (repo *MemberTagRepositoryImpl) DeleteByMemberId(memberId int) error {
	result := repo.Db.Where("member_id = ?", memberId).Delete(&model.MemberTag{})

	if result.Error != nil {
		return result.Error
	}

	return nil
}
