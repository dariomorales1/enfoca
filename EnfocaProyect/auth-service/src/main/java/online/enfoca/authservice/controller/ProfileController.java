package online.enfoca.authservice.controller;

import jakarta.validation.Valid;
import online.enfoca.authservice.dto.request.ChangePasswordRequest;
import online.enfoca.authservice.dto.request.UpdateProfileRequest;
import online.enfoca.authservice.dto.response.ProfileResponse;
import online.enfoca.authservice.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Authentication auth) {
        return ResponseEntity.ok(profileService.getProfile(resolveUserId(auth)));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request,
                                                         Authentication auth) {
        return ResponseEntity.ok(profileService.updateProfile(resolveUserId(auth), request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                               Authentication auth) {
        profileService.changePassword(resolveUserId(auth), request);
        return ResponseEntity.noContent().build();
    }

    private Long resolveUserId(Authentication auth) {
        return Long.valueOf((String) auth.getPrincipal());
    }
}
