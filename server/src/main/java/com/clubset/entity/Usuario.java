package com.clubset.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.clubset.enums.*; // Tus enums
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.Collection;
import java.util.List;

@Entity
@Data
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String apellido;

    @Column(unique = true)
    private String email;

    private String telefono;
    private String password;
    private String rol; 

    // --- Perfil Deportivo (Tus campos existentes) ---
    @Enumerated(EnumType.STRING)
    private Categoria categoria;

    @Enumerated(EnumType.STRING)
    private Genero genero;

    @Enumerated(EnumType.STRING)
    private Mano manoHabil;

    private String fotoPerfilUrl;

    private Integer puntosRanking = 0;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // Evita bucles infinitos si alguna vez devolvemos la entidad directa
    private List<Reserva> reservas;

    // --- MÉTODOS DE USER DETAILS (OBLIGATORIOS) ---
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Convierte tu String "ADMIN" en un Rol de Spring Security
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol));
    }

    @Override
    public String getUsername() {
        return email; // Usamos el email para loguearse
    }

    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}