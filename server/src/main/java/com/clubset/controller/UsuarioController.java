package com.clubset.controller;

import org.springframework.web.bind.annotation.*;

import com.clubset.dto.UsuarioDTO;
import com.clubset.entity.Usuario;
import com.clubset.service.UsuarioService;

import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController // 1. Indica que es una API REST (devuelve JSON, no HTML)
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    // GET:
    // Ruta final: GET http://localhost:8080/api/usuarios
    @GetMapping
    public List<UsuarioDTO> obtenerTodos() {
        return usuarioService.obtenerTodosLosUsuarios();
    }

    // POST:
    // Ruta final: POST http://localhost:8080/api/usuarios
    @PostMapping
    public UsuarioDTO crearUsuario(@RequestBody Usuario usuario) {
        return usuarioService.guardarUsuario(usuario);
    }
}