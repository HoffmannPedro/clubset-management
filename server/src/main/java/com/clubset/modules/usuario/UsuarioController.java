package com.clubset.modules.usuario;

import com.clubset.modules.finanza.FinanzasService;
import com.clubset.modules.usuario.dto.MovimientoPerfilDTO;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.clubset.modules.usuario.dto.UsuarioDTO;
import lombok.RequiredArgsConstructor;
import java.util.List;
import jakarta.validation.Valid;
import com.clubset.modules.usuario.dto.UsuarioRegistroRequestDTO;
import com.clubset.modules.usuario.dto.UsuarioActualizacionRequestDTO;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final FinanzasService finanzasService;

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
    public UsuarioDTO crearUsuario(@Valid @RequestBody UsuarioRegistroRequestDTO requestDTO) {
        return usuarioService.guardarDesdeRegistro(requestDTO);
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

    // PUT: Actualizar usuario existente (ADMIN ONLY - Campos Deportivos)
    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public UsuarioDTO actualizarUsuario(@PathVariable Long id, @Valid @RequestBody UsuarioActualizacionRequestDTO requestDTO) {
        return usuarioService.actualizarDesdeDTO(id, requestDTO);
    }
    
    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public void eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
    }

    // PUT: Actualizar MI perfil (Autogestión segura)
    @PutMapping("/me")
    public UsuarioDTO actualizarMiPerfil(@Valid @RequestBody UsuarioActualizacionRequestDTO actualizacion) {
        // 1. Obtenemos quién es el usuario logueado gracias al Token
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        // 2. Mandamos a actualizar de forma segura
        return usuarioService.actualizarPerfilPropio(email, actualizacion);
    }

    @GetMapping("/{id}/historial")
    public org.springframework.data.domain.Page<MovimientoPerfilDTO> obtenerHistorial(
            @PathVariable Long id, 
            @org.springframework.data.web.PageableDefault(size = 5) org.springframework.data.domain.Pageable pageable) {
        return finanzasService.obtenerHistorialFinancieroPaginado(id, pageable);
    }

    @GetMapping("/me/historial")
    public org.springframework.data.domain.Page<MovimientoPerfilDTO> obtenerMiHistorial(
            @org.springframework.data.web.PageableDefault(size = 5) org.springframework.data.domain.Pageable pageable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UsuarioDTO user = usuarioService.buscarPorEmail(email);
        return finanzasService.obtenerHistorialFinancieroPaginado(user.getId(), pageable);
    }
}