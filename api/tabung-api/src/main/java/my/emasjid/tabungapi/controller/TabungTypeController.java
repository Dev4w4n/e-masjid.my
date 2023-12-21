package my.emasjid.tabungapi.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import my.emasjid.tabungapi.entity.TabungType;
import my.emasjid.tabungapi.repository.TabungTypeRepository;

@Controller
@RequestMapping("${deploy.url}")
public class TabungTypeController {
 
    @Autowired
    private TabungTypeRepository tabungTypeRepository;

    @ResponseBody
    @GetMapping("/tabung-types")
    public ResponseEntity<List<TabungType>> getTabungTypes() {
        try {
            List<TabungType> tabungTypes = tabungTypeRepository.findAll();
            return ResponseEntity.ok(tabungTypes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @ResponseBody
    @PostMapping("/tabung-types")
    public ResponseEntity<TabungType> createTabungType(TabungType tabungType) {
        try {
            tabungType = tabungTypeRepository.save(tabungType);
            return ResponseEntity.ok(tabungType);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @ResponseBody
    @DeleteMapping("/tabung-types/{id}")
    public ResponseEntity<TabungType> deleteTabungTypeById(@PathVariable Long id) {
        try {
            tabungTypeRepository.deleteById(id);
            return ResponseEntity.ok().body(null);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
