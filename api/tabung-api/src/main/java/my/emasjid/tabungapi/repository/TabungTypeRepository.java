package my.emasjid.tabungapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import my.emasjid.tabungapi.entity.TabungType;

public interface TabungTypeRepository extends JpaRepository<TabungType, Long> {
    
}
