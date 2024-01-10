package my.emasjid.tetapanapi.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import my.emasjid.tetapanapi.entity.Tetapan;
import my.emasjid.tetapanapi.service.TetapanService;

@Controller
@RequestMapping("${deploy.url}")
public class TetapanController {
    
    @Autowired
    private TetapanService tetapanService;
    
    @GetMapping("/tetapan")
    @ResponseBody
    public List<Tetapan> findAll() {
        return tetapanService.findAll();
    }

    @GetMapping("/tetapan/{kunci}")
    @ResponseBody
    public Tetapan findByKunci(@PathVariable String kunci) {
        return tetapanService.findByKunci(kunci);
    }

    @PostMapping("/tetapan")
    @ResponseBody
    public Tetapan save(@RequestBody Tetapan tetapan) {
        return tetapanService.save(tetapan);
    }

    @PostMapping("/tetapan")
    @ResponseBody
    public List<Tetapan> save(@RequestBody List<Tetapan> senaraiTetapan) {
        return tetapanService.saveAll(senaraiTetapan);
    }
}
