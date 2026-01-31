package com.clubset.config; // ⚠️ Asegúrate que coincida con tu carpeta real

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Integrar la configuración de CORS definida abajo
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 2. Desactivar CSRF (necesario para que funcionen los POST desde otro dominio)
            .csrf(csrf -> csrf.disable())
            // 3. Permitir acceso público a todo (por ahora)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // --- AQUÍ ESTABA EL ERROR ---
        // Agregamos AMBOS dominios: Local y Producción (Vercel)
        configuration.setAllowedOrigins(Arrays.asList(
            "https://clubset-management.vercel.app", // <--- IMPORTANTE: Sin barra al final
            "http://localhost:5173"
        ));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Headers permitidos (necesario para JWT y JSON)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control", "X-Requested-With"));
        
        // Permitir credenciales
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}