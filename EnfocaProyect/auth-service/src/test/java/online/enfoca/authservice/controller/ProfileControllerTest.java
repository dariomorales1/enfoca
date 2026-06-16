package online.enfoca.authservice.controller;

import online.enfoca.authservice.dto.request.ChangePasswordRequest;
import online.enfoca.authservice.dto.request.UpdateProfileRequest;
import online.enfoca.authservice.dto.response.ProfileResponse;
import online.enfoca.authservice.service.ProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileControllerTest {

    @Mock
    private ProfileService profileService;

    @InjectMocks
    private ProfileController controller;

    private Authentication auth;

    @BeforeEach
    void setUp() {
        auth = new UsernamePasswordAuthenticationToken("42", null);
    }

    @Test
    void getProfile_returns200WithProfileResponse() {
        ProfileResponse expected = ProfileResponse.builder()
                .id(42L).email("user@test.com").firstName("Ana").role("USER").build();
        when(profileService.getProfile(42L)).thenReturn(expected);

        ResponseEntity<ProfileResponse> result = controller.getProfile(auth);

        assertThat(result.getStatusCode().value()).isEqualTo(200);
        assertThat(result.getBody()).isEqualTo(expected);
        verify(profileService).getProfile(42L);
    }

    @Test
    void updateProfile_returns200WithUpdatedProfile() {
        UpdateProfileRequest req = UpdateProfileRequest.builder()
                .firstName("Nuevo").lastName("Nombre").build();
        ProfileResponse expected = ProfileResponse.builder()
                .id(42L).email("user@test.com").firstName("Nuevo").role("USER").build();
        when(profileService.updateProfile(42L, req)).thenReturn(expected);

        ResponseEntity<ProfileResponse> result = controller.updateProfile(req, auth);

        assertThat(result.getStatusCode().value()).isEqualTo(200);
        assertThat(result.getBody().getFirstName()).isEqualTo("Nuevo");
        verify(profileService).updateProfile(42L, req);
    }

    @Test
    void changePassword_returns204NoContent() {
        ChangePasswordRequest req = new ChangePasswordRequest("oldPass1", "newPass1");
        doNothing().when(profileService).changePassword(42L, req);

        ResponseEntity<Void> result = controller.changePassword(req, auth);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(profileService).changePassword(42L, req);
    }

    @Test
    void resolveUserId_extractsLongFromAuthPrincipal() {
        Authentication authWith100 = new UsernamePasswordAuthenticationToken("100", null);
        ProfileResponse resp = ProfileResponse.builder().id(100L).email("x@test.com").role("USER").build();
        when(profileService.getProfile(100L)).thenReturn(resp);

        controller.getProfile(authWith100);

        verify(profileService).getProfile(100L);
    }
}
