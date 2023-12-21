package my.emasjid.cadanganapi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import my.emasjid.cadanganapi.entity.Cadangan;
import my.emasjid.cadanganapi.repository.CadanganRepository;

@Service
public class CadanganService {

    @Autowired
    private CadanganRepository cadanganRepository;

    public Page<Cadangan> getAllCadangan(Pageable pageable) {
        return cadanganRepository.findAllCadangan(pageable);
    }

    public Cadangan save(Cadangan cadangan) {
        return cadanganRepository.save(cadangan);
    }

    public Cadangan save(Long id, Cadangan cadangan) {
        cadangan.setId(id);
        return save(cadangan);
    }

}
