package com.izan.khairatapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.izan.khairatapi.entity.MemberTag;

import jakarta.transaction.Transactional;

public interface MemberTagRepository extends JpaRepository<MemberTag, Long> {
    @Transactional
    void deleteByMemberId(Long memberId);
}
