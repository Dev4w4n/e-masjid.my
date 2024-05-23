package repository

import (
	"strconv"
	"strings"

	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	emasjidsaas "github.com/Dev4w4n/e-masjid.my/saas/saas"
	"github.com/gin-gonic/gin"
)

type MemberRepository interface {
	Save(ctx *gin.Context, member model.Member) (model.Member, error)
	CountAll(ctx *gin.Context) (int64, error)
	FindAll(ctx *gin.Context) ([]model.Member, error)
	FindAllOrderByPersonName(ctx *gin.Context) ([]model.Member, error)
	FindByTagOrderByMemberNameAsc(ctx *gin.Context, idStr string) ([]model.Member, error)
	FindByQuery(ctx *gin.Context, query string) ([]model.Member, error)
	FindById(ctx *gin.Context, id int) (model.Member, error)
}

type MemberRepositoryImpl struct {
}

func NewMemberRepository() MemberRepository {
	return &MemberRepositoryImpl{}
}

// CountAll implements MemberRepository.
func (repo *MemberRepositoryImpl) CountAll(ctx *gin.Context) (int64, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var count int64
	result := db.Model(&model.Member{}).Count(&count)

	if result.Error != nil {
		return 0, result.Error
	}

	return count, nil
}

// FindAll implements MemberRepository.
func (repo *MemberRepositoryImpl) FindAll(ctx *gin.Context) ([]model.Member, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var members []model.Member
	result := db.Find(&members)

	if result.Error != nil {
		return nil, result.Error
	}

	return members, nil
}

// FindAllOrderByPersonName implements MemberRepository.
func (repo *MemberRepositoryImpl) FindAllOrderByPersonName(ctx *gin.Context) ([]model.Member, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var members []model.Member
	result := db.
		Joins("JOIN person ON khairat_members.person_id = person.id").
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
func (repo *MemberRepositoryImpl) FindByQuery(ctx *gin.Context, query string) ([]model.Member, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var members []model.Member

	if query == "*" || query == "" {
		return repo.FindAllOrderByPersonName(ctx)
	}

	result := db.
		Joins("JOIN person ON khairat_members.person_id = person.id").
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
func (repo *MemberRepositoryImpl) FindById(ctx *gin.Context, id int) (model.Member, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	var member model.Member

	result := db.
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
func (repo *MemberRepositoryImpl) FindByTagOrderByMemberNameAsc(ctx *gin.Context, idStr string) ([]model.Member, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
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

	result := db.
		Joins("JOIN khairat_members_tags ON khairat_members.id = khairat_members_tags.member_id").
		Joins("JOIN khairat_tags ON khairat_members_tags.tags_id = khairat_tags.id").
		Joins("JOIN person ON khairat_members.person_id = person.id").
		Where("khairat_tags.id IN (?)", idInt64Slice).
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
func (repo *MemberRepositoryImpl) Save(ctx *gin.Context, member model.Member) (model.Member, error) {
	db := emasjidsaas.DbProvider.Get(ctx.Request.Context(), "")
	result := db.Save(&member)

	if result.Error != nil {
		return model.Member{}, result.Error
	}

	// Assuming the Save operation was successful, return the updated member
	return member, nil
}
