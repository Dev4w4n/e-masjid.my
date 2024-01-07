package my.emasjid.cadanganpublicapi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import my.emasjid.cadanganpublicapi.repository.CadanganRepository;
import my.emasjid.library.cadangan.entity.Cadangan;

@Service
public class CadanganService {

    @Autowired
    private CadanganRepository cadanganRepository;

    public Cadangan save(Cadangan cadangan) {
        return cadanganRepository.save(cadangan);
    }

}
