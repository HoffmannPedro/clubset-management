package com.clubset.service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.clubset.dto.UsuarioDTO;
import com.clubset.entity.Usuario;
import com.clubset.repository.ReservaRepository;
import com.clubset.repository.UsuarioRepository;
import com.clubset.mapper.UsuarioMapper;
import com.clubset.dto.MovimientoPerfilDTO;
import com.clubset.dto.request.UsuarioRegistroRequestDTO;
import com.clubset.dto.request.UsuarioActualizacionRequestDTO;
import com.clubset.enums.RolUsuario;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReservaRepository reservaRepository;
    private final FinanzasService finanzasService; // Inyectamos el calculador financiero
    private final UsuarioMapper usuarioMapper;
    

    public List<UsuarioDTO> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::ensamblarPerfil)
                .toList();
    }

    public UsuarioDTO guardarDesdeRegistro(UsuarioRegistroRequestDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setNombre(dto.getNombre());
        usuario.setApellido(dto.getApellido());
        usuario.setEmail(dto.getEmail());
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        usuario.setRol(RolUsuario.USER); 
        usuario.setPuntosRanking(0);
        
        usuarioRepository.save(usuario);
        return ensamblarPerfil(usuario);
    }

    public UsuarioDTO actualizarDesdeDTO(Long id, UsuarioActualizacionRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        actualizarCamposSeguros(usuario, dto);
        return ensamblarPerfil(usuarioRepository.save(usuario));
    }

    public UsuarioDTO guardarUsuario(Usuario usuario) {
        // Inicializar puntos si es null (nuevo usuario)
        if (usuario.getPuntosRanking() == null) {
            usuario.setPuntosRanking(0);
        }
        
        // <--- 3. LÓGICA DE ENCRIPTADO
        // Si el admin manda una contraseña (no está vacía), la encriptamos antes de guardar.
        // Así el sistema de Login podrá validarla después.
        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        // -----------------------------

        // Validación básica de duplicados (opcional pero recomendada)
        // if (usuario.getId() == null && usuarioRepository.existsByEmail(usuario.getEmail())) ...

        usuarioRepository.save(usuario);
        return ensamblarPerfil(usuario);
    }
    
    public UsuarioDTO obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(this::ensamblarPerfil)
                .orElse(null);
    }

    public UsuarioDTO buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .map(this::ensamblarPerfil)
                .orElse(null);
    }

    public void eliminarUsuario(Long id) {
        // Validamos si existe antes de intentar borrar (opcional, pero buena práctica)
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
        }
    }

    @Transactional
    public UsuarioDTO actualizarPerfilPropio(String email, UsuarioActualizacionRequestDTO datosNuevos) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        actualizarCamposSeguros(usuario, datosNuevos);

        return ensamblarPerfil(usuarioRepository.save(usuario));
    }

    private void actualizarCamposSeguros(Usuario usuario, UsuarioActualizacionRequestDTO datosNuevos) {
        if (datosNuevos.getNombre() != null && !datosNuevos.getNombre().isBlank()) {
            usuario.setNombre(datosNuevos.getNombre());
        }
        if (datosNuevos.getApellido() != null && !datosNuevos.getApellido().isBlank()) {
            usuario.setApellido(datosNuevos.getApellido());
        }
        if (datosNuevos.getTelefono() != null) {
            usuario.setTelefono(datosNuevos.getTelefono());
        }
        if (datosNuevos.getFotoPerfilUrl() != null) {
            usuario.setFotoPerfilUrl(datosNuevos.getFotoPerfilUrl());
        }
        if (datosNuevos.getManoHabil() != null) {
            usuario.setManoHabil(datosNuevos.getManoHabil());
        }
    }

    // Mapper actualizado
    private UsuarioDTO ensamblarPerfil(Usuario usuario) {
        // 1. Cálculos pesados delegados a SQL
        BigDecimal deudaBD = reservaRepository.calcularDeudaTotalUsuario(usuario.getId());
        BigDecimal deudaFinal = deudaBD != null ? deudaBD : BigDecimal.ZERO;
        
        Long partidos = reservaRepository.countByUsuarioId(usuario.getId());

        // 2. Historial financiero (limitado a 5 para el perfil)
        List<MovimientoPerfilDTO> movimientos = finanzasService.obtenerHistorialFinanciero(usuario.getId())
                .stream()
                .limit(5)
                .toList();

        // 3. MapStruct hace la magia de unir la entidad con los cálculos
        return usuarioMapper.toDTO(usuario, deudaFinal, partidos, movimientos);
    }
}