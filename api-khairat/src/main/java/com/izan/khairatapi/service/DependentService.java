package com.izan.khairatapi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.izan.khairatapi.entity.Dependent;
import com.izan.khairatapi.entity.Member;
import com.izan.khairatapi.entity.Person;
import com.izan.khairatapi.repository.DependentRepository;
import com.izan.khairatapi.repository.MemberRepository;
import com.izan.khairatapi.repository.PersonRepository;

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
