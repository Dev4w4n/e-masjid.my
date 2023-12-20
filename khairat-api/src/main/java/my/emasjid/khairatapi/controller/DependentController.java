package my.emasjid.khairatapi.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import my.emasjid.khairatapi.entity.Dependent;
import my.emasjid.khairatapi.repository.DependentRepository;
import my.emasjid.khairatapi.service.DependentService;

@Controller
@RequestMapping("${deploy.url}")
public class DependentController {
    @Autowired
    private DependentRepository dependentRepository;

    @Autowired
    private DependentService dependentService;

    @GetMapping("/dependents/findByMemberId/{id}")
    public ResponseEntity<List<Dependent>> findByMemberId(@PathVariable Long id) {
        
        try {
            List<Dependent> dependent = dependentRepository.findAllByMemberId(id);
            return ResponseEntity.ok(dependent);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping("/dependents/save/{memberId}")
    @ResponseBody
    public ResponseEntity<Dependent> save(@RequestBody Dependent dependent, @PathVariable Long memberId) {
        try {
            return ResponseEntity.ok(dependentService.save(dependent, memberId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @DeleteMapping("/dependents/delete/{id}")
    @ResponseBody
    public ResponseEntity<Dependent> deleteById(@PathVariable Long id) {
        try {
            dependentService.deleteById(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    
}
