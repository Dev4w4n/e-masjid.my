package repository

import (
	"strconv"
	"strings"

	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"gorm.io/gorm"
)

type MemberRepository interface {
	Save(member model.Member) (model.Member, error)
	CountAll() (int64, error)
	FindAll() ([]model.Member, error)
	FindAllOrderByPersonName() ([]model.Member, error)
	FindByTagOrderByMemberNameAsc(idStr string) ([]model.Member, error)
	FindByQuery(query string) ([]model.Member, error)
	FindById(id int) (model.Member, error)
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
	var count int64
	result := repo.db.Model(&model.Member{}).Count(&count)

	if result.Error != nil {
		return 0, result.Error
	}

	return count, nil
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

// FindAllOrderByPersonName implements MemberRepository.
func (repo *MemberRepositoryImpl) FindAllOrderByPersonName() ([]model.Member, error) {
	var members []model.Member
	result := repo.db.
		Joins("JOIN person ON members.person_id = person.id").
		Preload("Person").
		Preload("MemberTags.Tag").
		Preload("PaymentHistory").
		Order("person.name ASC").
		Find(&members)

	if result.Error != nil {
		return nil, result.Error
	}

	return members, nil
}

// FindBy implements MemberRepository.
func (repo *MemberRepositoryImpl) FindByQuery(query string) ([]model.Member, error) {
	var members []model.Member

	if query == "*" || query == "" {
		return repo.FindAllOrderByPersonName()
	}

	result := repo.db.
		Joins("JOIN person ON members.person_id = person.id").
		Where("person.name LIKE ?", "%"+query+"%").
		Or("person.ic_number LIKE ?", "%"+query+"%").
		Or("person.phone LIKE ?", "%"+query+"%").
		Preload("Person").
		Preload("MemberTags.Tag").
		Preload("PaymentHistory").
		Order("person.name ASC").
		Find(&members)

	if result.Error != nil {
		return nil, result.Error
	}

	return members, nil
}

// FindById implements MemberRepository.
func (repo *MemberRepositoryImpl) FindById(id int) (model.Member, error) {
	var member model.Member

	result := repo.db.
		// Joins("JOIN person ON members.person_id = person.id").
		Where("id=?", id).
		Preload("Person").
		Preload("MemberTags.Tag").
		Preload("PaymentHistory").
		Preload("Dependents").
		Preload("Dependents.Person").
		// Order("person.name ASC").
		Take(&member)

	if result.Error != nil {
		return model.Member{}, result.Error
	}

	return member, nil
}

// FindByTag implements MemberRepository.
func (repo *MemberRepositoryImpl) FindByTagOrderByMemberNameAsc(idStr string) ([]model.Member, error) {
	var members []model.Member

	// Split the comma-separated string into a slice of strings
	idSlice := strings.Split(idStr, ",")

	// Convert the slice of strings to a slice of int64
	var idInt64Slice []int64
	for _, idStr := range idSlice {
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			return nil, err
		}
		idInt64Slice = append(idInt64Slice, id)
	}

	result := repo.db.
		Joins("JOIN members_tags ON members.id = members_tags.member_id").
		Joins("JOIN tags ON members_tags.tags_id = tags.id").
		Joins("JOIN person ON members.person_id = person.id").
		Where("tags.id IN (?)", idInt64Slice).
		Preload("Person").
		Preload("MemberTags.Tag").
		Preload("PaymentHistory").
		Order("person.name ASC").
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
