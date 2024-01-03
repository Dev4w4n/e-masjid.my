package my.emasjid.tabungapi.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import my.emasjid.tabungapi.entity.Kutipan;
import my.emasjid.tabungapi.repository.KutipanRepository;

@Controller
@RequestMapping("${deploy.url}")
public class KutipanController {
    
    @Autowired
    private KutipanRepository kutipanRepository;

    @GetMapping("/kutipan/tabung/{id}")
    @ResponseBody
    public ResponseEntity<List<Kutipan>> getAllKutipanByTabungId(@PathVariable Long id) {
        try {
            List<Kutipan> kutipans = kutipanRepository.findAllByTabungIdOrderByIdDesc(id);
            return ResponseEntity.ok(kutipans);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/kutipan/tabung/{id}/betweenCreateDate")
    @ResponseBody
    public ResponseEntity<List<Kutipan>> getAllKutipanByTabungIdBetweenCreateDate(@PathVariable Long id
            ,@RequestParam Long fromDate, @RequestParam Long toDate) {
        try {
            List<Kutipan> kutipans = kutipanRepository.findAllByTabungIdAndCreateDateBetweenOrderByIdAsc(id, fromDate, toDate);
            return ResponseEntity.ok(kutipans);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/kutipan/{id}")
    @ResponseBody
    public ResponseEntity<Kutipan> getAllKutipanById(@PathVariable Long id) {
        try {
            Kutipan kutipan = kutipanRepository.findById(id).get();
            return ResponseEntity.ok(kutipan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/kutipan")
    @ResponseBody
    public ResponseEntity<Kutipan> createKutipan(@RequestBody Kutipan kutipan) {
        try {
            kutipan = kutipanRepository.save(kutipan);
            return ResponseEntity.ok(kutipan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    
}
