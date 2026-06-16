package online.enfoca.pomodoroservice.controller;

import jakarta.validation.Valid;
import online.enfoca.pomodoroservice.dto.PomodoroSessionResponse;
import online.enfoca.pomodoroservice.dto.StartSessionRequest;
import online.enfoca.pomodoroservice.mapper.PomodoroMapper;
import online.enfoca.pomodoroservice.model.entity.PomodoroSession;
import online.enfoca.pomodoroservice.model.enums.SessionStatus;
import online.enfoca.pomodoroservice.model.enums.SessionType;
import online.enfoca.pomodoroservice.service.PomodoroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pomodoro-sessions")
public class PomodoroController {

    @Autowired
    private PomodoroService service;

    @GetMapping
    public ResponseEntity<List<PomodoroSessionResponse>> getHistory(
            @RequestHeader("X-User-Id") String userId) {
        List<PomodoroSession> sessions = service.getSessionsByUser(userId);
        List<PomodoroSessionResponse> response = sessions.stream()
                .map(PomodoroMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/start")
    public ResponseEntity<PomodoroSessionResponse> start(@Valid @RequestBody StartSessionRequest request) {

        PomodoroSession session = service.startSession(request);
        return new ResponseEntity<>(PomodoroMapper.toResponse(session), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/begin")
    public ResponseEntity<PomodoroSessionResponse> begin(@PathVariable Long id) {
        PomodoroSession session = service.beginSession(id);
        return ResponseEntity.ok(PomodoroMapper.toResponse(session));
    }

    @PatchMapping("/{id}/finish")
    public ResponseEntity<PomodoroSessionResponse> finish(
            @PathVariable Long id,
            @RequestParam SessionStatus status) {

        PomodoroSession session = service.finishSession(id, status);
        return ResponseEntity.ok(PomodoroMapper.toResponse(session));
    }

}
