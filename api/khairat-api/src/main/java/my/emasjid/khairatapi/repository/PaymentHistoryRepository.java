package my.emasjid.khairatapi.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import my.emasjid.khairatapi.entity.PaymentHistory;
import org.springframework.data.jpa.repository.Query;

public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory, Long> {
    
    List<PaymentHistory> findByMemberIdAndPaymentDateGreaterThan(Long memberId, Long startEpoch);

    default Optional<PaymentHistory> findPaymentHistoryByMemberIdAndCurrentYear(Long memberId) {
        long currentYear = java.time.Year.now().getValue();
        long startEpoch = java.time.LocalDate.of((int) currentYear, 1, 1).atStartOfDay().toEpochSecond(java.time.ZoneOffset.UTC);
        List<PaymentHistory> paymentHistoryList = findByMemberIdAndPaymentDateGreaterThan(memberId, startEpoch * 1000);
        return paymentHistoryList.isEmpty() ? Optional.empty() : Optional.of(paymentHistoryList.get(0));
    }

    @Query(value = "SELECT COUNT(DISTINCT member_id) AS total_members_paid " +
            "FROM khairat_payment_history " +
            "WHERE EXTRACT(YEAR FROM DATE_TRUNC('year', to_timestamp(payment_date/1000))) = EXTRACT(YEAR FROM CURRENT_DATE) ",
            nativeQuery = true)
    Long getTotalMembersPaidForCurrentYear();
}
