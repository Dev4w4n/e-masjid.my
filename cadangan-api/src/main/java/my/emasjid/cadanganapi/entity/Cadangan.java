package my.emasjid.cadanganapi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "cadangan")
public class Cadangan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cadangan_types_id", referencedColumnName = "id")
    private CadanganType cadanganType;

    @Column(name = "cadangan_text", nullable = false, length = 1024)
    private String cadanganText;

    @Column(name = "tindakan_text", length = 1024)
    private String tindakanText;

    @Column(name = "is_open", nullable = false)
    private Boolean isOpen = false;

    @Column(name = "score")
    private Short score;

    @Column(name = "create_date")
    private Long createDate;
}