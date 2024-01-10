package my.emasjid.tetapanapi.service;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import my.emasjid.tetapanapi.entity.Tetapan;
import my.emasjid.tetapanapi.repository.TetapanRepository;

@Service
public class TetapanService {

    Logger logger = LoggerFactory.getLogger(TetapanService.class);

    @Autowired
    private TetapanRepository tetapanRepository;

    public Tetapan findByKunci(String kunci) {
        return tetapanRepository.findById(kunci)
            .orElseThrow();
    }

    public List<Tetapan> findAll() {
        return tetapanRepository.findAll();
    }

    @Transactional
    public Tetapan save(Tetapan tetapan) {
        return tetapanRepository.save(tetapan);
    }

    @Transactional
    public List<Tetapan> saveAll(List<Tetapan> senaraiTetapan) {
        return tetapanRepository.saveAll(senaraiTetapan);
    }
}
