package my.emasjid.tetapanapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import my.emasjid.tetapanapi.entity.Tetapan;

public interface TetapanRepository extends JpaRepository<Tetapan, String> {
    
}
