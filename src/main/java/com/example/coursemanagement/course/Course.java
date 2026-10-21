package com.example.coursemanagement.course;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(
    name = "courses",
    uniqueConstraints = @UniqueConstraint(columnNames = "code")
)
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Course code is required")
    @Size(max = 30)
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @NotBlank(message = "Course title is required")
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String title;

    @NotNull(message = "Credit hours are required")
    @Min(value = 1, message = "Credits must be at least 1")
    @Max(value = 12, message = "Credits cannot exceed 12")
    @Column(nullable = false)
    private Integer credits;

    @Size(max = 100)
    private String instructor;

    @Size(max = 80)
    private String department;

    public Course() {
    }

    public Course(
        String code,
        String title,
        Integer credits,
        String instructor,
        String department
    ) {
        this.code = code;
        this.title = title;
        this.credits = credits;
        this.instructor = instructor;
        this.department = department;
    }

    @PrePersist
    @PreUpdate
    public void normalize() {
        if (code != null) code = code.trim().toUpperCase();
        if (title != null) title = title.trim();
        if (instructor != null) instructor = instructor.trim();
        if (department != null) department = department.trim();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public String getInstructor() { return instructor; }
    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }

    public String getDepartment() { return department; }
    public void setDepartment(String department) {
        this.department = department;
    }
}