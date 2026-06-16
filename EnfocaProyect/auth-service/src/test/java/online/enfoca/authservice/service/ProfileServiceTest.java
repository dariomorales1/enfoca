package online.enfoca.authservice.service;

import online.enfoca.authservice.dto.request.ChangePasswordRequest;
import online.enfoca.authservice.dto.request.UpdateProfileRequest;
import online.enfoca.authservice.dto.response.ProfileResponse;
import online.enfoca.authservice.exception.InvalidCredentialsException;
import online.enfoca.authservice.model.Role;
import online.enfoca.authservice.model.User;
import online.enfoca.authservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ProfileService profileService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@test.com")
                .passwordHash("hashed-password")
                .nombre("Juan")
                .lastName("Pérez")
                .role(Role.USER)
                .active(true)
                .build();
    }

    @Test
    void getProfile_returnsProfileResponseForExistingUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        ProfileResponse result = profileService.getProfile(1L);

        assertThat(result.getEmail()).isEqualTo("test@test.com");
        assertThat(result.getFirstName()).isEqualTo("Juan");
        assertThat(result.getLastName()).isEqualTo("Pérez");
        assertThat(result.getRole()).isEqualTo("USER");
    }

    @Test
    void getProfile_throwsWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> profileService.getProfile(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void updateProfile_updatesFirstNameOnly() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(testUser)).thenReturn(testUser);

        UpdateProfileRequest req = UpdateProfileRequest.builder().firstName("Carlos").build();
        profileService.updateProfile(1L, req);

        assertThat(testUser.getNombre()).isEqualTo("Carlos");
        assertThat(testUser.getLastName()).isEqualTo("Pérez");
        verify(userRepository).save(testUser);
    }

    @Test
    void updateProfile_updatesAllFields() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(testUser)).thenReturn(testUser);

        UpdateProfileRequest req = UpdateProfileRequest.builder()
                .firstName("Nuevo")
                .lastName("Apellido")
                .biography("Mi bio")
                .avatarUrl("https://example.com/avatar.png")
                .build();

        profileService.updateProfile(1L, req);

        assertThat(testUser.getNombre()).isEqualTo("Nuevo");
        assertThat(testUser.getLastName()).isEqualTo("Apellido");
        assertThat(testUser.getBiography()).isEqualTo("Mi bio");
        assertThat(testUser.getAvatarUrl()).isEqualTo("https://example.com/avatar.png");
    }

    @Test
    void updateProfile_doesNotOverrideNullFields() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(testUser)).thenReturn(testUser);

        UpdateProfileRequest req = UpdateProfileRequest.builder().build();
        profileService.updateProfile(1L, req);

        assertThat(testUser.getNombre()).isEqualTo("Juan");
        assertThat(testUser.getLastName()).isEqualTo("Pérez");
    }

    @Test
    void changePassword_successfullyUpdatesPasswordHash() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("currentPass", "hashed-password")).thenReturn(true);
        when(passwordEncoder.encode("NewPass1!")).thenReturn("new-hashed-password");

        ChangePasswordRequest req = new ChangePasswordRequest("currentPass", "NewPass1!");
        profileService.changePassword(1L, req);

        assertThat(testUser.getPasswordHash()).isEqualTo("new-hashed-password");
        verify(userRepository).save(testUser);
    }

    @Test
    void changePassword_throwsWhenCurrentPasswordWrong() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPass", "hashed-password")).thenReturn(false);

        ChangePasswordRequest req = new ChangePasswordRequest("wrongPass", "NewPass1!");

        assertThatThrownBy(() -> profileService.changePassword(1L, req))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(userRepository, never()).save(any());
    }
}
