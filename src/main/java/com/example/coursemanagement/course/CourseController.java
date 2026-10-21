package com.example.coursemanagement.course;

import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    private final CourseRepository repository;

    public CourseController(CourseRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Course> getAll() {
        return repository.findAll().stream()
            .sorted((a, b) ->
                a.getCode().compareToIgnoreCase(b.getCode()))
            .toList();
    }

    @GetMapping("/{id}")
    public Course getOne(@PathVariable Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Course not found"
            ));
    }

    @PostMapping
    public ResponseEntity<?> create(
            @Valid @RequestBody Course course) {

        course.setId(null);

        if (repository.existsByCodeIgnoreCase(
                course.getCode().trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "message",
                    "A course with this code already exists."
                ));
        }

        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(repository.save(course));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "message", "Course code must be unique."
                ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @Valid @RequestBody Course input) {

        Course existing = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Course not found"
            ));

        String code = input.getCode().trim();

        var duplicate = repository.findByCodeIgnoreCase(code);

        if (duplicate.isPresent()
                && !duplicate.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "message",
                    "A course with this code already exists."
                ));
        }

        existing.setCode(code);
        existing.setTitle(input.getTitle());
        existing.setCredits(input.getCredits());
        existing.setInstructor(input.getInstructor());
        existing.setDepartment(input.getDepartment());

        try {
            return ResponseEntity.ok(repository.save(existing));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "message", "Course code must be unique."
                ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Course not found"
            );
        }

        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}