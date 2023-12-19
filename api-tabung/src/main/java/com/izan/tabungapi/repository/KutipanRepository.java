package com.izan.tabungapi.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.izan.tabungapi.entity.Kutipan;

public interface KutipanRepository extends JpaRepository<Kutipan, Long> {
    List<Kutipan> findAllByTabungId(Long tabungId);
    List<Kutipan> findAllByTabungIdOrderByIdDesc(Long tabungId);
    
}
