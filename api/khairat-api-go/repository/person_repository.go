package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"gorm.io/gorm"
)

type PersonRepository interface {
	FindById(id int64) (model.Person, error)
	Save(person model.Person) (model.Person, error)
	Delete(id int64) error
}

type PersonRepositoryImpl struct {
	Db *gorm.DB
}

func NewPersonRepository(db *gorm.DB) PersonRepository {
	db.AutoMigrate(&model.Person{})

	return &PersonRepositoryImpl{Db: db}
}

// Delete implements PersonRepository.
func (repo *PersonRepositoryImpl) Delete(id int64) error {
	result := repo.Db.Where("id = ?", id).Delete(&model.Person{})

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// FindById implements PersonRepository.
func (repo *PersonRepositoryImpl) FindById(id int64) (model.Person, error) {
	var person model.Person

	result := repo.Db.Where("id = ?", id).Find(&person)

	if result.Error != nil {
		return model.Person{}, result.Error
	}

	return person, nil
}

// Save implements PersonRepository.
func (repo *PersonRepositoryImpl) Save(person model.Person) (model.Person, error) {
	result := repo.Db.Save(&person)

	if result.Error != nil {
		return model.Person{}, result.Error
	}

	return person, nil
}
