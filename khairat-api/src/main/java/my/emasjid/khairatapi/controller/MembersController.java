package my.emasjid.khairatapi.controller;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import my.emasjid.khairatapi.entity.Member;
import my.emasjid.khairatapi.entity.Person;
import my.emasjid.khairatapi.service.MemberService;

@Controller
@RequestMapping("${deploy.url}")
public class MembersController {
    
    @Autowired
    private MemberService memberService;
    
    @GetMapping("/members/findAll")
    @ResponseBody
    public Page<Member> findAll() {
        Pageable pageable = PageRequest.of(0, 10);
        return memberService.findAll(pageable);
    }

    @GetMapping("/members/find/{id}")
    @ResponseBody
    public ResponseEntity<Member> findOne(@PathVariable Long id) {
        try {
            Member member = memberService.findOne(id);
            return ResponseEntity.ok(member);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/members/findBy")
    @ResponseBody
    public ResponseEntity<List<Member>> findBy(@RequestParam String query) {
        try {
            List<Member> member = null;
            if (query.equals("*")) {
                member = memberService.findAllByOrderByPersonName();
            } else {
                Person person = new Person();
                person.setName(query);
                person.setIcNumber(query);
                person.setAddress(query);
                person.setPhone(query);
                member = memberService.findBy(person);
            }
            return ResponseEntity.ok(member);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/members/count")
    @ResponseBody
    public ResponseEntity<Long> count() {
        try {
            Long count = memberService.count();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // @GetMapping("/members/paidPercentage")
    // @ResponseBody
    // public ResponseEntity<Double> paidPercentage() {
    //     try {
    //         Double percentage = memberService.paidPercentage();
    //         return ResponseEntity.ok(percentage);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    //     }
    // }

    @PostMapping("/members/save")
    @ResponseBody
    public Member save(@RequestBody Member member) {
        return memberService.save(member);
    }
}
