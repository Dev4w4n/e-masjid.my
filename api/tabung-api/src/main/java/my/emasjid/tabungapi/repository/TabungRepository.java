package my.emasjid.tabungapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import my.emasjid.tabungapi.entity.Tabung;

public interface TabungRepository extends JpaRepository<Tabung, Long> {
    
}
