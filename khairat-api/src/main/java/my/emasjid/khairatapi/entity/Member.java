package my.emasjid.khairatapi.entity;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@Table(name = "members")
public class Member {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "person_id")
    private Person person;

    @OneToMany(mappedBy = "member", fetch = FetchType.LAZY)
    private List<MemberTag> memberTags;

    @OneToMany(mappedBy = "member", fetch = FetchType.LAZY)
    private List<Dependent> dependents;

    @OneToMany(mappedBy = "member", fetch = FetchType.LAZY)
    private List<PaymentHistory> paymentHistories;
}