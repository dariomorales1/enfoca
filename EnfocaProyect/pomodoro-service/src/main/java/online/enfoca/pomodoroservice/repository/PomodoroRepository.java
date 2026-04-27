package online.enfoca.pomodoroservice.repository;

import online.enfoca.pomodoroservice.model.entity.PomodoroSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PomodoroRepository extends JpaRepository<PomodoroSession, Long> {

    List<PomodoroSession> findByUserIdOrderByStartTimeDesc(String userId);


}
