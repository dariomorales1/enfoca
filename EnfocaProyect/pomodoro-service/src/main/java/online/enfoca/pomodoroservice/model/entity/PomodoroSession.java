package online.enfoca.pomodoroservice.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import online.enfoca.pomodoroservice.model.enums.SessionStatus;
import online.enfoca.pomodoroservice.model.enums.SessionType;

import java.time.LocalDateTime;

@Entity
@Table(name = "pomodoro_sessions")
@Data
public class PomodoroSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id" ,nullable = false)
    private String userId;

    @Column(name = "topic_id")
    private Long topicId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionType sessionType;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

}
