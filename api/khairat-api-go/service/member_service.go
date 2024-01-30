package service

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/repository"
)

type MemberService interface {
	Save(member model.Member) (model.Member, error)
	FindOne(id int) (model.Member, error)
	FindAll() (model.Response, error)
	FindBy(person model.Person) ([]model.Member, error)
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
	panic("unimplemented")
}

// FindAllOrderbyPersonName implements MemberService.
func (repo *MemberServiceImpl) FindAllOrderbyPersonName() ([]model.Member, error) {
	panic("unimplemented")
}

// FindBy implements MemberService.
func (repo *MemberServiceImpl) FindBy(person model.Person) ([]model.Member, error) {
	panic("unimplemented")
}

// FindOne implements MemberService.
func (repo *MemberServiceImpl) FindOne(id int) (model.Member, error) {
	panic("unimplemented")
}

// Save implements MemberService.
func (repo *MemberServiceImpl) Save(member model.Member) (model.Member, error) {
	panic("unimplemented")
}
