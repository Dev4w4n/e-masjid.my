package my.emasjid.cadanganpublicapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"my.emasjid.library","my.emasjid.cadanganpublicapi"})
public class CadanganPublicApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(CadanganPublicApiApplication.class, args);
	}

}
