package com.clubset.config; // ⚠️ Asegúrate que este package coincida con tu estructura de carpetas

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Aplica a todas las rutas de la API
                .allowedOrigins(
                    "https://clubset-management.vercel.app", // Tu Frontend en Producción
                    "http://localhost:5173" // Tu Frontend en Local (para pruebas)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Métodos permitidos
                .allowedHeaders("*") // Permitir todos los headers
                .allowCredentials(true); // Permitir cookies/credenciales si hiciera falta
    }
}