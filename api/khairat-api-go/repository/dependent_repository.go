package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"gorm.io/gorm"
)

type DependentRepository interface {
	Save(dependent model.Dependent, memberId int64) error
	Delete(dependent model.Dependent) error
	DeleteById(id int) error
	FindById(id int) (model.Dependent, error)
	FindAllByMemberId(memberId int) ([]model.Dependent, error)
}

type DependentRepositoryImpl struct {
	Db *gorm.DB
}

func NewDependentRepository(db *gorm.DB) DependentRepository {
	db.AutoMigrate(&model.Dependent{})

	return &DependentRepositoryImpl{Db: db}
}

// DeleteByMemberId implements DependentRepository.
func (repo *DependentRepositoryImpl) Delete(dependent model.Dependent) error {
	result := repo.Db.Delete(&dependent)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// DeleteById implements DependentRepository.
func (repo *DependentRepositoryImpl) DeleteById(id int) error {
	result := repo.Db.Delete(&model.Dependent{}, id)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// FindAllByMemberId implements DependentRepository.
func (repo *DependentRepositoryImpl) FindById(id int) (model.Dependent, error) {
	var dependent model.Dependent

	result := repo.Db.Where("id = ?", id).Find(&dependent)

	if result.Error != nil {
		return dependent, result.Error
	}

	return dependent, nil
}

// Save implements DependentRepository.
func (repo *DependentRepositoryImpl) Save(dependent model.Dependent, memberId int64) error {
	dependent.MemberId = memberId
	result := repo.Db.Save(&dependent)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// FindAllByMemberId implements DependentRepository.
func (repo *DependentRepositoryImpl) FindAllByMemberId(memberId int) ([]model.Dependent, error) {
	var dependents []model.Dependent

	result := repo.Db.
		Where("member_id = ?", memberId).
		Preload("Person").
		Find(&dependents)

	if result.Error != nil {
		return dependents, result.Error
	}

	return dependents, nil
}
