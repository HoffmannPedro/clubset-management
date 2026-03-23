package com.clubset.modules.usuario.dto;

import com.clubset.core.shared.enums.Categoria;
import com.clubset.core.shared.enums.Genero;
import com.clubset.core.shared.enums.Mano;
import com.clubset.core.shared.enums.RolUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UsuarioRegistroRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email es incorrecto")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

    private String telefono;
    private String fotoPerfilUrl;
    private Mano manoHabil;
    private Categoria categoria;
    private Genero genero;
    private RolUsuario rol;
}
