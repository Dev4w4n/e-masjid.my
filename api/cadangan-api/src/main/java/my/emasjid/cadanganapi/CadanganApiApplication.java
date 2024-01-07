package my.emasjid.cadanganapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "my.emasjid.library.cadangan.entity")
public class CadanganApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(CadanganApiApplication.class, args);
	}

}
