package service

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/repository"
	"github.com/gin-gonic/gin"
)

type MemberService interface {
	Save(ctx *gin.Context, member model.Member) (model.Member, error)
	SaveBulk(ctx *gin.Context, members []model.Member) (bool, error)
	FindOne(ctx *gin.Context, id int) (model.Member, error)
	FindAll(ctx *gin.Context) (model.Response, error)
	FindByQuery(ctx *gin.Context, query string) ([]model.Member, error)
	FindAllOrderbyPersonName(ctx *gin.Context) ([]model.Member, error)
	CountAll(ctx *gin.Context) (int64, error)
	FindAllByTagIdOrderByMemberName(ctx *gin.Context, tagIdStr string) ([]model.Member, error)
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
func (repo *MemberServiceImpl) CountAll(ctx *gin.Context) (int64, error) {
	result, err := repo.memberRepository.CountAll(ctx)

	if err != nil {
		return 0, err
	}

	return result, nil
}

// FindAll implements MemberService.
func (repo *MemberServiceImpl) FindAll(ctx *gin.Context) (model.Response, error) {
	var response model.Response

	result, err := repo.memberRepository.FindAll(ctx)

	if err != nil {
		return response, err
	}

	response.Content = result

	return response, nil
}

// FindAllByTagIdOrderByMemberName implements MemberService.
func (repo *MemberServiceImpl) FindAllByTagIdOrderByMemberName(ctx *gin.Context, tagIdStr string) ([]model.Member, error) {
	var result []model.Member

	result, err := repo.memberRepository.FindByTagOrderByMemberNameAsc(ctx, tagIdStr)

	if err != nil {
		return nil, err
	}

	return result, nil
}

// FindAllOrderbyPersonName implements MemberService.
func (repo *MemberServiceImpl) FindAllOrderbyPersonName(ctx *gin.Context) ([]model.Member, error) {
	var result []model.Member

	result, err := repo.memberRepository.FindAllOrderByPersonName(ctx)

	if err != nil {
		return nil, err
	}

	return result, nil
}

// FindBy implements MemberService.
func (repo *MemberServiceImpl) FindByQuery(ctx *gin.Context, query string) ([]model.Member, error) {
	var result []model.Member

	result, err := repo.memberRepository.FindByQuery(ctx, query)

	if err != nil {
		return nil, err
	}

	return result, nil
}

// FindOne implements MemberService.
func (repo *MemberServiceImpl) FindOne(ctx *gin.Context, id int) (model.Member, error) {
	var result model.Member

	result, err := repo.memberRepository.FindById(ctx, id)

	if err != nil {
		return result, err
	}

	return result, nil
}

// Save implements MemberService.
func (repo *MemberServiceImpl) Save(ctx *gin.Context, member model.Member) (model.Member, error) {

	if member.Id == 0 {
		payments := member.PaymentHistory
		dependents := member.Dependents
		tags := member.MemberTags
		newPerson, err := repo.personRepository.Save(ctx, member.Person)

		if err != nil {
			return model.Member{}, err
		}

		member.PersonId = newPerson.Id
		member.Dependents = nil
		member.MemberTags = nil
		member.PaymentHistory = nil

		member, err := repo.memberRepository.Save(ctx, member)

		if err != nil {
			return model.Member{}, err
		}

		for _, dependent := range dependents {
			person := dependent.Person
			newPerson, err := repo.personRepository.Save(ctx, person)

			if err != nil {
				return model.Member{}, err
			}

			dependent.MemberId = member.Id
			dependent.PersonId = newPerson.Id

			err = repo.dependentRepository.Save(ctx, dependent, member.Id)

			if err != nil {
				return model.Member{}, err
			}
		}

		for _, tag := range tags {
			tag.MemberId = member.Id

			_, err = repo.memberTagRepository.Save(ctx, tag)

			if err != nil {
				return model.Member{}, err
			}
		}

		for _, payment := range payments {
			payment.MemberId = member.Id

			err = repo.paymentHistoryRepository.Save(ctx, payment)

			if err != nil {
				return model.Member{}, err
			}
		}

	} else {
		person := member.Person
		memberTags := member.MemberTags

		_, err := repo.personRepository.Save(ctx, person)

		if err != nil {
			return model.Member{}, err
		}

		err = repo.memberTagRepository.DeleteByMemberId(ctx, member.Id)

		if err != nil {
			return model.Member{}, err
		}

		for _, tag := range memberTags {
			tag.MemberId = member.Id

			_, err = repo.memberTagRepository.Save(ctx, tag)

			if err != nil {
				return model.Member{}, err
			}
		}

		err = repo.paymentHistoryRepository.UpdatePaymentHistory(ctx, member.PaymentHistory,
			member.Id)

		if err != nil {
			return model.Member{}, err
		}
	}

	return member, nil
}

func (repo *MemberServiceImpl) SaveBulk(ctx *gin.Context, members []model.Member) (bool, error) {
	for _, member := range members {
		_, err := repo.Save(ctx, member)
		if err != nil {
			return false, err
		}
	}

	return true, nil
}
