package my.emasjid.khairatapi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import my.emasjid.khairatapi.entity.Dependent;
import my.emasjid.khairatapi.entity.Member;
import my.emasjid.khairatapi.entity.Person;
import my.emasjid.khairatapi.repository.DependentRepository;
import my.emasjid.khairatapi.repository.MemberRepository;
import my.emasjid.khairatapi.repository.PersonRepository;

@Service
public class DependentService {
    
    @Autowired
    private DependentRepository dependentRepository;
    @Autowired
    private PersonRepository personRepository;
    @Autowired
    private MemberRepository memberRepository;

    public Dependent save(Dependent dependent, Long memberId) {
        Person newPerson = dependent.getPerson();
        newPerson = personRepository.save(newPerson);
        dependent.setPerson(newPerson);
        Member member = memberRepository.findById(memberId).orElse(null);
        dependent.setMember(member);
        return dependentRepository.save(dependent);
    }

    public void deleteById(Long id) {
        Dependent dependent = dependentRepository.findById(id).orElse(null);
        Person person = personRepository.findById(dependent.getPerson().getId()).orElse(null);
        dependentRepository.delete(dependent);
        personRepository.delete(person);
    }
}
