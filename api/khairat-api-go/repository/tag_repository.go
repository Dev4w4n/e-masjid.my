package repository

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"gorm.io/gorm"
)

type TagRepository interface {
	FindAll() (model.Response, error)
	Save(tag model.Tag) error
	Delete(id int) error
}

type TagRepositoryImpl struct {
	Db *gorm.DB
}

func NewTagRepository(db *gorm.DB) TagRepository {
	db.AutoMigrate(&model.Tag{})

	return &TagRepositoryImpl{Db: db}
}

// Delete implements TagRepository.
func (repo *TagRepositoryImpl) Delete(id int) error {
	var tag model.Tag
	result := repo.Db.Where("id = ?", id).Delete(&tag)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// FindAll implements TagRepository.
func (repo *TagRepositoryImpl) FindAll() (model.Response, error) {
	var tagList []model.Tag
	var response model.Response

	result := repo.Db.Find(&tagList)

	if result.Error != nil {
		return response, result.Error
	}

	response.Content = tagList

	return response, nil
}

// Save implements TagRepository.
func (repo *TagRepositoryImpl) Save(tag model.Tag) error {
	result := repo.Db.Save(&tag)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
