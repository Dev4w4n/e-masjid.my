package com.izan.khairatapi.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import com.izan.khairatapi.entity.Dependent;

import jakarta.transaction.Transactional;

public interface DependentRepository extends JpaRepository<Dependent, Long> {

    List<Dependent> findAllByMemberId(@Param("memberId") Long memberId);

    @Transactional
    void deleteByMemberId(Long memberId);
}
