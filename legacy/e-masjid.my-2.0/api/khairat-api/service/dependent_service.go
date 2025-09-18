package service

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/repository"
	"github.com/gin-gonic/gin"
)

type DependentService interface {
	Save(ctx *gin.Context, dependent model.Dependent, memberId int) error
	Delete(ctx *gin.Context, d int) error
}

type DependentServiceImpl struct {
	dependentRepository repository.DependentRepository
	memberRepository    repository.MemberRepository
	personRepository    repository.PersonRepository
}

func NewDependentService(dependentRepository repository.DependentRepository, memberRepository repository.MemberRepository, personRepository repository.PersonRepository) DependentService {
	return &DependentServiceImpl{
		dependentRepository: dependentRepository,
		memberRepository:    memberRepository,
		personRepository:    personRepository,
	}
}

// Delete implements DependentService.
func (repo *DependentServiceImpl) Delete(ctx *gin.Context, id int) error {
	dependent, err := repo.dependentRepository.FindById(ctx, id)

	if err != nil {
		return err
	}

	person, err := repo.personRepository.FindById(ctx, dependent.Person.Id)

	if err != nil {
		return err
	}

	err = repo.dependentRepository.Delete(ctx, dependent)

	if err != nil {
		return err
	}

	err = repo.personRepository.Delete(ctx, person.Id)

	if err != nil {
		return err
	}

	return nil
}

// Save implements DependentService.
func (repo *DependentServiceImpl) Save(ctx *gin.Context, dependent model.Dependent, memberId int) error {
	newPerson, err := repo.personRepository.Save(ctx, dependent.Person)
	if err != nil {
		return err
	}
	dependent.Person = newPerson

	member, err := repo.memberRepository.FindById(ctx, memberId)
	if err != nil {
		return err
	}
	dependent.Member = member

	err = repo.dependentRepository.Save(ctx, dependent, int64(memberId))
	if err != nil {
		return err
	}

	return nil
}
