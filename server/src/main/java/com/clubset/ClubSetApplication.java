package com.clubset;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class ClubSetApplication {

	public static void main(String[] args) {
		SpringApplication.run(ClubSetApplication.class, args);
	}

	@PostConstruct
    public void init() {
        // Forzamos a que toda la aplicación use la hora de Argentina
        TimeZone.setDefault(TimeZone.getTimeZone("America/Argentina/Buenos_Aires"));
    }

}
