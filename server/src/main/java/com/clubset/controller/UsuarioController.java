package com.clubset.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.clubset.dto.UsuarioDTO;
import com.clubset.entity.Usuario;
import com.clubset.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public List<UsuarioDTO> obtenerTodos() {
        return usuarioService.obtenerTodosLosUsuarios();
    }
    
    // Nuevo endpoint para ver detalles de un perfil específico
    @GetMapping("/{id}")
    public UsuarioDTO obtenerUno(@PathVariable Long id) {
        return usuarioService.obtenerPorId(id);
    }

    @PostMapping
    public UsuarioDTO crearUsuario(@RequestBody Usuario usuario) {
        return usuarioService.guardarUsuario(usuario);
    }

    // GET /api/usuarios/me -> Devuelve el perfil del usuario logueado
    @GetMapping("/me")
    public UsuarioDTO obtenerMiPerfil() {
        // 1. Spring Security nos da los datos del usuario actual desde el Token
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        // 2. Extraemos el email (que es nuestro username)
        String email = auth.getName();
        
        // 3. Buscamos los datos completos en la base
        return usuarioService.buscarPorEmail(email);
    }

    // PUT: Actualizar usuario existente
    @PutMapping("/{id}")
    public UsuarioDTO actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        // Aseguramos que el ID del body coincida con el del path
        usuario.setId(id);
        return usuarioService.guardarUsuario(usuario); // save() funciona como update si tiene ID
    }

    @DeleteMapping("/{id}")
    public void eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
    }
}