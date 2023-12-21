package my.emasjid.khairatapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import my.emasjid.khairatapi.entity.MemberTag;

import jakarta.transaction.Transactional;

public interface MemberTagRepository extends JpaRepository<MemberTag, Long> {
    @Transactional
    void deleteByMemberId(Long memberId);
}
