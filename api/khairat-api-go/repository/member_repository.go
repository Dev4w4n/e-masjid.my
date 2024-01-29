package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"gorm.io/gorm"
)

type MemberRepository interface {
	Save(member model.Member) error
	CountAll() (int, error)
	FindAll() ([]model.Member, error)
	FindById(id int) (model.Member, error)
	FindBy(member model.Member) ([]model.Member, error)
	FindByTag(tag model.Tag) ([]model.Member, error)
}

type MemberRepositoryImpl struct {
	db *gorm.DB
}

func NewMemberRepository(db *gorm.DB) MemberRepository {
	db.AutoMigrate(&model.Member{})

	return &MemberRepositoryImpl{db: db}
}

// CountAll implements MemberRepository.
func (repo *MemberRepositoryImpl) CountAll() (int, error) {
	panic("unimplemented")
}

// FindAll implements MemberRepository.
func (repo *MemberRepositoryImpl) FindAll() ([]model.Member, error) {
	panic("unimplemented")
}

// FindBy implements MemberRepository.
func (repo *MemberRepositoryImpl) FindBy(member model.Member) ([]model.Member, error) {
	panic("unimplemented")
}

// FindById implements MemberRepository.
func (repo *MemberRepositoryImpl) FindById(id int) (model.Member, error) {
	panic("unimplemented")
}

// FindByTag implements MemberRepository.
func (repo *MemberRepositoryImpl) FindByTag(tag model.Tag) ([]model.Member, error) {
	panic("unimplemented")
}

// Save implements MemberRepository.
func (repo *MemberRepositoryImpl) Save(member model.Member) error {
	panic("unimplemented")
}
