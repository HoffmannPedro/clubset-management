package com.clubset.service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder; // <--- 1. NUEVO IMPORT

import com.clubset.dto.ReservaDTO;
import com.clubset.dto.UsuarioDTO;
import com.clubset.entity.Reserva;
import com.clubset.entity.Usuario;
import com.clubset.repository.ReservaRepository;
import com.clubset.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReservaRepository reservaRepository;

    public List<UsuarioDTO> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::convertirADto)
                .toList();
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
        return convertirADto(usuario);
    }
    
    public UsuarioDTO obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(this::convertirADto)
                .orElse(null);
    }

    // --- NUEVO MÉTODO PARA PERFIL ---
    public UsuarioDTO buscarPorEmail(String email) {
        // Usamos el mismo repositorio que ya configuraste para el Auth
        return usuarioRepository.findByEmail(email)
                .map(this::convertirADto)
                .orElse(null);
    }

    public void eliminarUsuario(Long id) {
        // Validamos si existe antes de intentar borrar (opcional, pero buena práctica)
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
        }
    }

    // Mapper actualizado
    private UsuarioDTO convertirADto(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        dto.setEmail(usuario.getEmail());
        dto.setTelefono(usuario.getTelefono());
        dto.setRol(usuario.getRol());
        dto.setCategoria(usuario.getCategoria());
        dto.setGenero(usuario.getGenero());
        dto.setManoHabil(usuario.getManoHabil());
        dto.setPuntosRanking(usuario.getPuntosRanking());
        
        // --- 1. CÁLCULO DE DEUDA (CORREGIDO) ---
        // Traemos las reservas impagas
        List<Reserva> reservasImpagas = reservaRepository.findByUsuarioIdAndPagadoFalse(usuario.getId());
        
        // Sumamos el saldo pendiente de cada una usando Java
        // (Esto asume que tu entidad Reserva tiene el método getSaldoPendiente())
        BigDecimal deuda = reservasImpagas.stream()
                .map(Reserva::getSaldoPendiente) 
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        dto.setDeudaTotal(deuda);
        // ---------------------------------------

        // 2. Estadísticas
        dto.setPartidosJugados(reservaRepository.countByUsuarioId(usuario.getId()));

        // 3. Historial
        List<Reserva> ultimas = reservaRepository.findTop5ByUsuarioIdOrderByFechaHoraDesc(usuario.getId());
        
        List<ReservaDTO> historialDtos = ultimas.stream().map(r -> {
            ReservaDTO rDto = new ReservaDTO();
            rDto.setId(r.getId());
            rDto.setFechaHora(r.getFechaHora());
            rDto.setNombreCancha(r.getCancha().getNombre());
            rDto.setPagado(r.getPagado());
            rDto.setSaldoPendiente(r.getSaldoPendiente());
            rDto.setEstado(r.getEstado());
            return rDto;
        }).toList();
        
        dto.setUltimasReservas(historialDtos);

        return dto;
    }
}