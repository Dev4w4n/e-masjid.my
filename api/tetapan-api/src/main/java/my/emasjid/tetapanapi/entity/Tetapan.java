package my.emasjid.tetapanapi.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@Table(name = "tetapan")
public class Tetapan {
    
    @Id
    private String kunci;

    private String nilai;
    
}