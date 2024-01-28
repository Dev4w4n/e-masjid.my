package my.emasjid.khairatapi.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import my.emasjid.khairatapi.entity.PaymentHistory;
import my.emasjid.khairatapi.repository.PaymentHistoryRepository;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentHistoryRepository paymentHistoryRepository;

    public PaymentHistory save(PaymentHistory paymentHistory) {
        deleteCurrentYearPaymentHistory(paymentHistory.getMember().getId());
        return paymentHistoryRepository.save(paymentHistory);
    }

    public void deleteCurrentYearPaymentHistory(Long memberId) {
        Optional<PaymentHistory> optionalPaymentHistory = 
        paymentHistoryRepository.findPaymentHistoryByMemberIdAndCurrentYear(memberId);

        if (optionalPaymentHistory.isPresent()) {
            PaymentHistory paymentHistory = optionalPaymentHistory.get();
            paymentHistoryRepository.delete(paymentHistory);
        }
    }

    public Boolean isCurrentYearPaymentExist(Long memberId) {
        Optional<PaymentHistory> optionalPaymentHistory = 
        paymentHistoryRepository.findPaymentHistoryByMemberIdAndCurrentYear(memberId);
        if (optionalPaymentHistory.isPresent()) {
            return true;
        } else {
            return false;
        }
    }

    public Long getTotalMembersPaidForCurrentYear() {
        return paymentHistoryRepository.getTotalMembersPaidForCurrentYear();
    }
}
