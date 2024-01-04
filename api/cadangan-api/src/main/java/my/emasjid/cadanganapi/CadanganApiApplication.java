package my.emasjid.cadanganapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"my.emasjid.library","my.emasjid.cadanganapi"})
public class CadanganApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(CadanganApiApplication.class, args);
	}

}
