package my.emasjid.khairatapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import my.emasjid.khairatapi.entity.Person;

public interface PersonRepository extends JpaRepository<Person, Long> {
    
}
