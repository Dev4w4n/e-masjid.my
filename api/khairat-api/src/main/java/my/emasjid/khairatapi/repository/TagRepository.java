package my.emasjid.khairatapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import my.emasjid.khairatapi.entity.Tag;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
}
