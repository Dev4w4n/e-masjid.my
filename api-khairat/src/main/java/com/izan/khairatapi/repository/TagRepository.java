package com.izan.khairatapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.izan.khairatapi.entity.Tag;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
}
