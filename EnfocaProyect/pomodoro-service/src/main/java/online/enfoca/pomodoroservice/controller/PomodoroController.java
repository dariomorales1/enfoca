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

@RestController
@RequestMapping("/api/pomodoro")
public class PomodoroController {

    @Autowired
    private PomodoroService service;

    @PostMapping("/start")
    public ResponseEntity<PomodoroSessionResponse> start(@Valid @RequestBody StartSessionRequest request) {

        PomodoroSession session = service.startSession(request);
        return new ResponseEntity<>(PomodoroMapper.toResponse(session), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/finish")
    public ResponseEntity<PomodoroSessionResponse> finish(
            @PathVariable Long id,
            @RequestParam SessionStatus status) {

        PomodoroSession session = service.finishSession(id, status);
        return ResponseEntity.ok(PomodoroMapper.toResponse(session));
    }

}
