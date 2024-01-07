package my.emasjid.cadanganapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import my.emasjid.library.cadangan.entity.CadanganType;

public interface CadanganTypeRepository extends JpaRepository<CadanganType, Long> {

}
