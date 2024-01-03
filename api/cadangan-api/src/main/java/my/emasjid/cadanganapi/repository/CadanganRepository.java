package my.emasjid.cadanganapi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import my.emasjid.cadanganapi.entity.Cadangan;

public interface CadanganRepository extends JpaRepository<Cadangan, Long> {
    public Page<Cadangan> findAll(Pageable pageable);

    public Page<Cadangan> findByCadanganTypeIdAndIsOpen(Long cadanganTypeId, Boolean isOpen, Pageable pageable);

    public Page<Cadangan> findByIsOpen(Boolean isOpen, Pageable pageable);

    @Query(nativeQuery = true,
        value = "SELECT " +
                "SUM(CASE WHEN c.cadangan_types_id = 1 AND c.is_open = true THEN 1 ELSE 0 END) AS totalNew, " +
                "SUM(CASE WHEN c.cadangan_types_id = 2 AND c.is_open = true THEN 1 ELSE 0 END) AS totalCadangan, " +
                "SUM(CASE WHEN c.cadangan_types_id = 3 AND c.is_open = true THEN 1 ELSE 0 END) AS totalAduan, " +
                "SUM(CASE WHEN c.cadangan_types_id = 4 AND c.is_open = true THEN 1 ELSE 0 END) AS totalLain, " +
                "SUM(CASE WHEN c.is_open = false THEN 1 ELSE 0 END) AS totalClosed " +
                "FROM cadangan c " +
                "LEFT JOIN cadangan_types ct ON c.cadangan_types_id = ct.id"
    )
    Object getTotalCadanganByType();
}
