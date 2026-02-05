package com.clubset.dto;
import lombok.Data;
import com.clubset.enums.Categoria;
import com.clubset.enums.Genero;
import com.clubset.enums.Mano;

@Data
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono; // Nuevo
    private String rol;
    
    // Datos Deportivos
    private Categoria categoria;
    private Genero genero;
    private Mano manoHabil;
    private String fotoPerfilUrl;
    private Integer puntosRanking;
    
    // Password NO se devuelve aquí por seguridad
    // Si necesitamos recibirla para crear, usaremos un "UsuarioCreateDTO" o el Entity en el Controller (como haces ahora)
}