package my.emasjid.cadanganpublicapi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import my.emasjid.cadanganpublicapi.service.CadanganService;
import my.emasjid.library.cadangan.entity.Cadangan;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
@RequestMapping("${deploy.url}")
public class CadanganController {

    @Autowired
    private CadanganService cadanganService;
    
    @PostMapping("/cadangan")
    public ResponseEntity<Cadangan> createCadangan(@RequestBody Cadangan cadangan) {
        try {
            return ResponseEntity.ok(cadanganService.save(cadangan));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
    
}
