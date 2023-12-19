package com.izan.khairatapi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.izan.khairatapi.entity.PaymentHistory;
import com.izan.khairatapi.service.PaymentService;

@Controller
@RequestMapping("${deploy.url}")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;

    @PostMapping("/payment/save")
    @ResponseBody
    public ResponseEntity<PaymentHistory> save(@RequestBody PaymentHistory paymentHistory) {
        try{
            return ResponseEntity.ok(paymentService.save(paymentHistory));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @DeleteMapping("/payment/delete/{memberId}")
    @ResponseBody
    public ResponseEntity<PaymentHistory> delete(@PathVariable Long memberId) {
        try{
            paymentService.deleteCurrentYearPaymentHistory(memberId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
}
