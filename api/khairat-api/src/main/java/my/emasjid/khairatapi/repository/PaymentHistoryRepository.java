package my.emasjid.khairatapi.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import my.emasjid.khairatapi.entity.PaymentHistory;

public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory, Long> {
    
    List<PaymentHistory> findByMemberIdAndPaymentDateGreaterThan(Long memberId, Long startEpoch);

    default Optional<PaymentHistory> findPaymentHistoryByMemberIdAndCurrentYear(Long memberId) {
        long currentYear = java.time.Year.now().getValue();
        long startEpoch = java.time.LocalDate.of((int) currentYear, 1, 1).atStartOfDay().toEpochSecond(java.time.ZoneOffset.UTC);
        List<PaymentHistory> paymentHistoryList = findByMemberIdAndPaymentDateGreaterThan(memberId, startEpoch * 1000);
        return paymentHistoryList.isEmpty() ? Optional.empty() : Optional.of(paymentHistoryList.get(0));
    }
}
