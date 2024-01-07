package my.emasjid.khairatapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import my.emasjid.khairatapi.entity.Member;
import java.util.List;

public interface MemberRepository extends JpaRepository<Member, Long> {
    
    List<Member> findByPersonNameContainingIgnoreCaseOrPersonIcNumberContainingIgnoreCaseOrPersonPhoneContainingIgnoreCaseOrPersonAddressContainingIgnoreCase(
            String name, String icNumber, String phone, String address);

    List<Member> findAllByOrderByPersonName();

    @Query("SELECT DISTINCT m, m.person.name FROM Member m JOIN m.memberTags mt WHERE mt.tag.id IN (:tagId) ORDER BY m.person.name ASC")
    List<Member> findAllByTagIdOrderByMemberNameAsc(@Param("tagId") List<Long> tagId);

}
