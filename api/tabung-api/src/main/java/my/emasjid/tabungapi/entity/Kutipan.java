package my.emasjid.tabungapi.entity;

import org.hibernate.annotations.Formula;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
@Entity
@Table(name = "kutipan")
public class Kutipan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tabung_id", referencedColumnName = "id")
    private Tabung tabung;

    private Integer total1c;
    private Integer total5c;
    private Integer total10c;
    private Integer total20c;
    private Integer total50c;
    private Integer total1d;
    private Integer total5d;
    private Integer total10d;
    private Integer total20d;
    private Integer total50d;
    private Integer total100d;

    @Formula(value = "(total1c * 0.01 + total5c * 0.05 + total10c * 0.1 + total20c * 0.2 + total50c * 0.5 + " +
            "total1d + total5d * 5 + total10d * 10 + total20d * 20 + total50d * 50 + total100d * 100)")
    private Long total;
    
    private Long createDate;
}