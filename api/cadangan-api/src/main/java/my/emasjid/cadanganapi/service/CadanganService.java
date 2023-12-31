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
        return cadanganRepository.findAll(pageable);
    }

    public Page<Cadangan> getAllCadanganByType(Long cadanganTypeId, Boolean isOpen,Pageable pageable) {
        return cadanganRepository.findByCadanganTypeIdAndIsOpen(cadanganTypeId, isOpen, pageable);
    }

    public Page<Cadangan> getAllCadanganByType(Boolean isOpen,Pageable pageable) {
        return cadanganRepository.findByIsOpen(isOpen, pageable);
    }

    public Object getTotalCadanganByType() {
        return cadanganRepository.getTotalCadanganByType();
    }

    public Cadangan getCadanganById(Long id) {
        return cadanganRepository.findById(id).get();
    }

    public Cadangan save(Cadangan cadangan) {
        return cadanganRepository.save(cadangan);
    }

    public Cadangan save(Long id, Cadangan cadangan) {
        cadangan.setId(id);
        return save(cadangan);
    }

}
