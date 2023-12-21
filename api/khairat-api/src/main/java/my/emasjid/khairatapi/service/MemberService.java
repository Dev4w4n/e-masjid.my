package my.emasjid.khairatapi.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import my.emasjid.khairatapi.entity.Dependent;
import my.emasjid.khairatapi.entity.Member;
import my.emasjid.khairatapi.entity.MemberTag;
import my.emasjid.khairatapi.entity.PaymentHistory;
import my.emasjid.khairatapi.entity.Person;
import my.emasjid.khairatapi.repository.DependentRepository;
import my.emasjid.khairatapi.repository.MemberRepository;
import my.emasjid.khairatapi.repository.MemberTagRepository;
import my.emasjid.khairatapi.repository.PaymentHistoryRepository;
import my.emasjid.khairatapi.repository.PersonRepository;


@Service
public class MemberService {

    Logger logger = LoggerFactory.getLogger(MemberService.class);
    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private PersonRepository personRepository;
    @Autowired
    private DependentRepository dependentRepository;
    @Autowired
    private MemberTagRepository memberTagRepository;
    @Autowired
    private PaymentHistoryRepository paymentHistoryRepository;
    @Autowired
    private PaymentService paymentService;

    public Member save(Member member) {
        Long memberId = member.getId();
        List<PaymentHistory> paymentHistory = member.getPaymentHistories();

        if (memberId == null) {
            Person person = member.getPerson();
            List<MemberTag> memberTags = member.getMemberTags();
            List<Dependent> dependents = member.getDependents();
    
            person = personRepository.save(person);
    
            member.setPerson(person);
            member.setMemberTags(null);
            member.setDependents(null);
            member = memberRepository.save(member);
    
            final Member newMember = member;
    
            memberTags.forEach(tags -> {
                tags.setMember(newMember);
            });
    
            dependents.forEach(dependent -> {
                Person personD = dependent.getPerson();
                personD = personRepository.save(personD);
                dependent.setPerson(personD);
                dependent.setMember(newMember);
            });

            paymentHistory.forEach(payment -> {
                payment.setMember(newMember);
            });
    
            memberTags = memberTagRepository.saveAll(memberTags);
            dependents = dependentRepository.saveAll(dependents);
            paymentHistory = paymentHistoryRepository.saveAll(paymentHistory);

        } else {
            Person person = member.getPerson();
            List<MemberTag> memberTags = member.getMemberTags();
            // List<Dependent> dependents = member.getDependents();

            person = personRepository.save(person);
            member.setPerson(person);
            member.setMemberTags(null);
            member.setDependents(null);
    
            final Member newMember = member;

            memberTagRepository.deleteByMemberId(memberId);
            memberTags.forEach(tags -> {
                tags.setMember(newMember);
            });
    
            // dependentRepository.deleteByMemberId(memberId);
            // dependents.forEach(dependent -> {
            //     Person personD = dependent.getPerson();
            //     if(personD.getId() != null){
            //         personRepository.delete(personD);
            //     }
            // });
            // dependents.forEach(dependent -> {
            //     Person personD = dependent.getPerson();
            //     if(personD.getId() == null){
            //         personD = personRepository.save(personD);
            //     }
            //     dependent.setPerson(personD);
            //     dependent.setMember(newMember);
            // });
            // dependents = dependentRepository.saveAll(dependents);
    
            memberTags = memberTagRepository.saveAll(memberTags);
            updatePaymentHistory(paymentHistory, memberId);
        }

        return member;
    }

private void updatePaymentHistory(List<PaymentHistory> paymentHistory, Long memberId) {
    if (paymentHistory.isEmpty()) {
        paymentService.deleteCurrentYearPaymentHistory(memberId);
    } else {
        if (!paymentService.isCurrentYearPaymentExist(memberId)) {
            for (PaymentHistory history : paymentHistory) {
                if (history.getId() == null) {
                    Member member = findOne(memberId);
                    history.setMember(member);
                    paymentService.save(history);
                    break;
                }
            }
        }
    }
}

    public Member findOne(Long id) {
        return memberRepository.findById(id).get();
    }

    public Page<Member> findAll(Pageable pageable) {
        return memberRepository.findAll(pageable);
    }

    public List<Member> findBy(Person person){
        return memberRepository.findByPersonNameContainingIgnoreCaseOrPersonIcNumberContainingIgnoreCaseOrPersonPhoneContainingIgnoreCaseOrPersonAddressContainingIgnoreCase(
            person.getName(), person.getIcNumber(), person.getPhone(), person.getAddress());
    }

    public List<Member> findAllByOrderByPersonName(){
        return memberRepository.findAllByOrderByPersonName();
    }

    public Long count(){
        return memberRepository.count();
    }

    // public Double paidPercentage(){
    //     return memberRepository.paidPercentage();
    // }
}
