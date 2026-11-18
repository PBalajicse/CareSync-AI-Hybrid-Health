package caresync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {"caresync", "caressyncbackend"})
@org.springframework.boot.persistence.autoconfigure.EntityScan(basePackages = {"caresync", "caressyncbackend"})
@EnableJpaRepositories(basePackages = {"caresync", "caressyncbackend"})
public class CaresyncBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CaresyncBackendApplication.class, args);
	}
}
