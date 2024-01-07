package my.emasjid.cadanganpublicapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import my.emasjid.library.cadangan.entity.Cadangan;

public interface CadanganRepository extends JpaRepository<Cadangan, Long> {

}
