package my.emasjid.cadanganpublicapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "my.emasjid.library.cadangan.entity")
public class CadanganPublicApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(CadanganPublicApiApplication.class, args);
	}

}
