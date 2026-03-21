package com.clubset.service;

import com.clubset.modules.reserva.Reserva;
import com.clubset.modules.reserva.ReservaService;
import com.clubset.modules.usuario.Usuario;
import com.clubset.core.shared.enums.RolUsuario;
import com.clubset.modules.reserva.ReservaRepository;
import com.clubset.modules.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ReservaService reservaService;

    private Reserva reserva;
    private Usuario propietario;
    private Usuario atacanteRaso;
    private Usuario administrador;

    @BeforeEach
    void setUp() {
        // Arrange - Setup base models
        propietario = new Usuario();
        propietario.setId(1L);
        propietario.setEmail("victima@mail.com");
        propietario.setRol(RolUsuario.USER);

        atacanteRaso = new Usuario();
        atacanteRaso.setId(2L);
        atacanteRaso.setEmail("atacante@mail.com");
        atacanteRaso.setRol(RolUsuario.USER);

        administrador = new Usuario();
        administrador.setId(3L);
        administrador.setEmail("admin@mail.com");
        administrador.setRol(RolUsuario.ADMIN);

        reserva = new Reserva();
        reserva.setId(100L);
        reserva.setUsuario(propietario);
        reserva.setPagos(new ArrayList<>()); // Sin pagos para permitir la cancelación
    }

    @Test
    @DisplayName("Debe lanzar SecurityException cuando un usuario raso intenta cancelar una reserva ajena")
    void debeLanzarSecurityException_cuandoUsuarioRasoCancelaReservaAjena() {
        // Given (Arrange)
        Long idReserva = reserva.getId();

        when(reservaRepository.findById(idReserva)).thenReturn(Optional.of(reserva));

        // When & Then (Act & Assert)
        SecurityException exception = assertThrows(SecurityException.class, () -> {
            reservaService.cancelarReserva(idReserva, atacanteRaso);
        });

        assertEquals("Acceso denegado: No tienes permiso para cancelar esta reserva.", exception.getMessage());
        
        // Assert: NUNCA se llama a delete
        verify(reservaRepository, never()).delete(any(Reserva.class));
    }

    @Test
    @DisplayName("Debe cancelar exitosamente cuando el usuario es el propietario de la reserva")
    void debeCancelar_cuandoUsuarioEsPropietario() {
        // Given (Arrange)
        Long idReserva = reserva.getId();

        when(reservaRepository.findById(idReserva)).thenReturn(Optional.of(reserva));

        // When (Act)
        reservaService.cancelarReserva(idReserva, propietario);

        // Then (Assert)
        verify(reservaRepository, times(1)).delete(reserva);
    }

    @Test
    @DisplayName("Debe cancelar exitosamente cuando el usuario no es propietario pero tiene rol ADMIN")
    void debeCancelar_cuandoUsuarioEsAdmin() {
        // Given (Arrange)
        Long idReserva = reserva.getId();

        when(reservaRepository.findById(idReserva)).thenReturn(Optional.of(reserva));

        // When (Act)
        reservaService.cancelarReserva(idReserva, administrador);

        // Then (Assert)
        verify(reservaRepository, times(1)).delete(reserva);
    }
}
