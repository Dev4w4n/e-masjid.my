package com.izan.tabungapi.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.izan.tabungapi.entity.Tabung;
import com.izan.tabungapi.entity.TabungType;
import com.izan.tabungapi.repository.TabungRepository;
import com.izan.tabungapi.repository.TabungTypeRepository;

@Controller
@RequestMapping("${deploy.url}")
public class TabungController {
    
    @Autowired
    private TabungRepository tabungRepository;

    @Autowired
    private TabungTypeRepository tabungTypeRepository;

    @GetMapping("/tabung")
    @ResponseBody
    public ResponseEntity<List<Tabung>> getAllTabung() {
        try {
            List<Tabung> tabungs = tabungRepository.findAll();
            return ResponseEntity.ok(tabungs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/tabung/{id}")
    @ResponseBody
    public ResponseEntity<Tabung> getTabungById(@PathVariable Long id) {
        try {
            Tabung tabung = tabungRepository.findById(id).get();
            return ResponseEntity.ok(tabung);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/tabung")
    @ResponseBody
    public ResponseEntity<Tabung> createTabung(@RequestBody Tabung tabung) {
        try {
            TabungType tabungType = tabungTypeRepository.findById(tabung.getTabungType().getId()).get();
            tabung.setTabungType(tabungType);
            tabung = tabungRepository.save(tabung);
            return ResponseEntity.ok(tabung);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/tabung/{id}")
    @ResponseBody
    public ResponseEntity<Tabung> deleteTabungById(@PathVariable Long id) {
        try {
            tabungRepository.deleteById(id);
            return ResponseEntity.ok().body(null);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
