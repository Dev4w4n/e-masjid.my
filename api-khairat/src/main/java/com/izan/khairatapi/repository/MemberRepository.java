package com.izan.khairatapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.izan.khairatapi.entity.Member;
import java.util.List;

public interface MemberRepository extends JpaRepository<Member, Long> {
    
    List<Member> findByPersonNameContainingIgnoreCaseOrPersonIcNumberContainingIgnoreCaseOrPersonPhoneContainingIgnoreCaseOrPersonAddressContainingIgnoreCase(
            String name, String icNumber, String phone, String address);

    List<Member> findAllByOrderByPersonName();
}
