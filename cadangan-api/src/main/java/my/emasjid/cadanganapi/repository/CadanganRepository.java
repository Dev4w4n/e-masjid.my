package my.emasjid.cadanganapi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import my.emasjid.cadanganapi.entity.Cadangan;

public interface CadanganRepository extends JpaRepository<Cadangan, Long> {
    public Page<Cadangan> findAll(Pageable pageable);
}
