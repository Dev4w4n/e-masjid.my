package service

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/repository"
)

type DependentService interface {
	Save(dependent model.Dependent, memberId int) error
	Delete(d int) error
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
func (repo *DependentServiceImpl) Delete(id int) error {
	dependent, err := repo.dependentRepository.FindById(id)

	if err != nil {
		return err
	}

	person, err := repo.personRepository.FindById(dependent.Person.Id)

	if err != nil {
		return err
	}

	err = repo.dependentRepository.Delete(dependent)

	if err != nil {
		return err
	}

	err = repo.personRepository.Delete(person.Id)

	if err != nil {
		return err
	}

	return nil
}

// Save implements DependentService.
func (repo *DependentServiceImpl) Save(dependent model.Dependent, memberId int) error {
	newPerson, err := repo.personRepository.Save(dependent.Person)
	if err != nil {
		return err
	}
	dependent.Person = newPerson

	member, err := repo.memberRepository.FindById(memberId)
	if err != nil {
		return err
	}
	dependent.Member = member

	err = repo.dependentRepository.Save(dependent, int64(memberId))
	if err != nil {
		return err
	}

	return nil
}
