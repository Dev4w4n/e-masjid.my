package service

import (
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/repository"
)

type MemberService interface {
	Save(member model.Member) error
}

type MemberServiceImpl struct {
	memberRepository repository.MemberRepository
	personRepository repository.PersonRepository
}
