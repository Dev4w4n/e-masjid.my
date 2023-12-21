package my.emasjid.khairatapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import my.emasjid.khairatapi.entity.Member;
import java.util.List;

public interface MemberRepository extends JpaRepository<Member, Long> {
    
    List<Member> findByPersonNameContainingIgnoreCaseOrPersonIcNumberContainingIgnoreCaseOrPersonPhoneContainingIgnoreCaseOrPersonAddressContainingIgnoreCase(
            String name, String icNumber, String phone, String address);

    List<Member> findAllByOrderByPersonName();
}
