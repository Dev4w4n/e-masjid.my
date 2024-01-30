package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"gorm.io/gorm"
)

type MemberRepository interface {
	Save(member model.Member) (model.Member, error)
	CountAll() (int64, error)
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
func (repo *MemberRepositoryImpl) CountAll() (int64, error) {
	result := repo.db.Find(&model.Member{})

	return result.RowsAffected, result.Error
}

// FindAll implements MemberRepository.
func (repo *MemberRepositoryImpl) FindAll() ([]model.Member, error) {
	var members []model.Member
	result := repo.db.Find(&members)

	if result.Error != nil {
		return nil, result.Error
	}

	return members, nil
}

// FindBy implements MemberRepository.
func (repo *MemberRepositoryImpl) FindBy(member model.Member) ([]model.Member, error) {
	var members []model.Member
	result := repo.db.Where(&member).Find(&members)

	if result.Error != nil {
		return nil, result.Error
	}

	return members, nil
}

// FindById implements MemberRepository.
func (repo *MemberRepositoryImpl) FindById(id int) (model.Member, error) {
	result, err := repo.FindBy(model.Member{Id: id})

	if err != nil {
		return model.Member{}, err
	}

	return result[0], nil
}

// FindByTag implements MemberRepository.
func (repo *MemberRepositoryImpl) FindByTag(tag model.Tag) ([]model.Member, error) {
	var members []model.Member
	result := repo.db.
		Joins("JOIN member_tags ON members.id = member_tags.member_id").
		Joins("JOIN tags ON member_tags.tag_id = tags.id").
		Where("tags.id = ?", tag.Id).
		Find(&members)

	if result.Error != nil {
		return nil, result.Error
	}

	return members, nil
}

// Save implements MemberRepository.
func (repo *MemberRepositoryImpl) Save(member model.Member) (model.Member, error) {
	result := repo.db.Save(&member)

	if result.Error != nil {
		return model.Member{}, result.Error
	}

	// Assuming the Save operation was successful, return the updated member
	return member, nil
}
