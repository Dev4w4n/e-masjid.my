package my.emasjid.tabungapi.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import my.emasjid.tabungapi.entity.Kutipan;

public interface KutipanRepository extends JpaRepository<Kutipan, Long> {
    List<Kutipan> findAllByTabungId(Long tabungId);
    List<Kutipan> findAllByTabungIdOrderByIdDesc(Long tabungId);
    List<Kutipan> findAllByTabungIdAndCreateDateBetweenOrderByIdAsc(Long tabungId, Long fromDate, Long toDate);
}
