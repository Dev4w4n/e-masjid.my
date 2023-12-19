package com.izan.khairatapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.izan.khairatapi.entity.Person;

public interface PersonRepository extends JpaRepository<Person, Long> {
    
}
