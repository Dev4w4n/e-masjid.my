package service

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/repository"
)

type MemberService interface {
	Save(member model.Member) (model.Member, error)
	FindOne(id int) (model.Member, error)
	FindAll() (model.Response, error)
	FindByQuery(query string) ([]model.Member, error)
	FindAllOrderbyPersonName() ([]model.Member, error)
	CountAll() (int64, error)
	FindAllByTagIdOrderByMemberName(tagIdStr string) ([]model.Member, error)
}

type MemberServiceImpl struct {
	memberRepository         repository.MemberRepository
	personRepository         repository.PersonRepository
	dependentRepository      repository.DependentRepository
	memberTagRepository      repository.MemberTagRepository
	paymentHistoryRepository repository.PaymentHistoryRepository
}

func NewMemberService(memberRepository repository.MemberRepository,
	personRepository repository.PersonRepository,
	dependentRepository repository.DependentRepository,
	memberTagRepository repository.MemberTagRepository,
	paymentHistoryRepository repository.PaymentHistoryRepository) MemberService {
	return &MemberServiceImpl{
		memberRepository:         memberRepository,
		personRepository:         personRepository,
		dependentRepository:      dependentRepository,
		memberTagRepository:      memberTagRepository,
		paymentHistoryRepository: paymentHistoryRepository,
	}
}

// CountAll implements MemberService.
func (repo *MemberServiceImpl) CountAll() (int64, error) {
	result, err := repo.memberRepository.CountAll()

	if err != nil {
		return 0, err
	}

	return result, nil
}

// FindAll implements MemberService.
func (repo *MemberServiceImpl) FindAll() (model.Response, error) {
	var response model.Response

	result, err := repo.memberRepository.FindAll()

	if err != nil {
		return response, err
	}

	response.Content = result

	return response, nil
}

// FindAllByTagIdOrderByMemberName implements MemberService.
func (repo *MemberServiceImpl) FindAllByTagIdOrderByMemberName(tagIdStr string) ([]model.Member, error) {
	var result []model.Member

	result, err := repo.memberRepository.FindByTagOrderByMemberNameAsc(tagIdStr)

	if err != nil {
		return nil, err
	}

	return result, nil
}

// FindAllOrderbyPersonName implements MemberService.
func (repo *MemberServiceImpl) FindAllOrderbyPersonName() ([]model.Member, error) {
	var result []model.Member

	result, err := repo.memberRepository.FindAllOrderByPersonName()

	if err != nil {
		return nil, err
	}

	return result, nil
}

// FindBy implements MemberService.
func (repo *MemberServiceImpl) FindByQuery(query string) ([]model.Member, error) {
	var result []model.Member

	result, err := repo.memberRepository.FindByQuery(query)

	if err != nil {
		return nil, err
	}

	return result, nil
}

// FindOne implements MemberService.
func (repo *MemberServiceImpl) FindOne(id int) (model.Member, error) {
	var result model.Member

	result, err := repo.memberRepository.FindById(id)

	if err != nil {
		return result, err
	}

	return result, nil
}

// Save implements MemberService.
func (repo *MemberServiceImpl) Save(member model.Member) (model.Member, error) {

	if member.Id == 0 {
		payments := member.PaymentHistory
		dependents := member.Dependents
		tags := member.MemberTags
		newPerson, err := repo.personRepository.Save(member.Person)

		if err != nil {
			return model.Member{}, err
		}

		member.PersonId = newPerson.Id
		member.Dependents = nil
		member.MemberTags = nil
		member.PaymentHistory = nil

		member, err := repo.memberRepository.Save(member)

		if err != nil {
			return model.Member{}, err
		}

		for _, dependent := range dependents {
			person := dependent.Person
			newPerson, err := repo.personRepository.Save(person)

			if err != nil {
				return model.Member{}, err
			}

			dependent.MemberId = member.Id
			dependent.PersonId = newPerson.Id

			err = repo.dependentRepository.Save(dependent, member.Id)

			if err != nil {
				return model.Member{}, err
			}
		}

		for _, tag := range tags {
			tag.MemberId = member.Id

			_, err = repo.memberTagRepository.Save(tag)

			if err != nil {
				return model.Member{}, err
			}
		}

		for _, payment := range payments {
			payment.MemberId = member.Id

			err = repo.paymentHistoryRepository.Save(payment)

			if err != nil {
				return model.Member{}, err
			}
		}

	} else {
		person := member.Person
		memberTags := member.MemberTags

		_, err := repo.personRepository.Save(person)

		if err != nil {
			return model.Member{}, err
		}

		err = repo.memberTagRepository.DeleteByMemberId(member.Id)

		if err != nil {
			return model.Member{}, err
		}

		for _, tag := range memberTags {
			tag.MemberId = member.Id

			_, err = repo.memberTagRepository.Save(tag)

			if err != nil {
				return model.Member{}, err
			}
		}

		err = repo.paymentHistoryRepository.UpdatePaymentHistory(member.PaymentHistory,
			member.Id)

		if err != nil {
			return model.Member{}, err
		}
	}

	return member, nil
}
