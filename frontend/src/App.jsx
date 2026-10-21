import { useEffect, useMemo, useState } from "react";
import {
  createCourse,
  deleteCourse,
  getCourses,
  updateCourse,
} from "./api/courseApi";

const emptyForm = {
  code: "",
  title: "",
  credits: 3,
  instructor: "",
  department: "Computer Science",
};

const departments = [
  "Computer Science",
  "Information Systems",
  "Information Technology",
  "Software Engineering",
  "Business Administration",
  "Mathematics",
];

function App() {
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All departments");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadCourses() {
    setLoading(true);
    setError("");

    try {
      setCourses(await getCourses());
    } catch {
      setError(
        "Could not connect to the API. Make sure Spring Boot and MySQL are running.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  const visibleCourses = useMemo(() => {
    return courses.filter((course) => {
      const haystack = [
        course.code,
        course.title,
        course.instructor,
        course.department,
      ]
        .map((value) => String(value ?? ""))
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(query.toLowerCase());

      const matchesDepartment =
        departmentFilter === "All departments" ||
        course.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [courses, query, departmentFilter]);

  function openAdd() {
    setEditing(null);
    setForm({ ...emptyForm });
    setError("");
    setModalOpen(true);
  }

  function openEdit(course) {
    setEditing(course);

    setForm({
      code: String(course.code ?? ""),
      title: String(course.title ?? ""),
      credits: Number(course.credits ?? 3),
      instructor: String(course.instructor ?? ""),
      department: String(course.department ?? "Computer Science"),
    });

    setError("");
    setModalOpen(true);
  }

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");

    const payload = {
      ...form,
      code: String(form.code).trim().toUpperCase(),
      title: String(form.title).trim(),
      credits: Number(form.credits),
      instructor: String(form.instructor).trim(),
      department: String(form.department).trim(),
    };

    try {
      if (editing) {
        await updateCourse(editing.id, payload);
        setNotice("Course updated successfully.");
      } else {
        await createCourse(payload);
        setNotice("Course created successfully.");
      }

      setModalOpen(false);
      await loadCourses();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response?.status === 400
            ? "Please check the required fields and credit hours."
            : "Could not save course. Check that the backend is running and the course code is unique."),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course) {
    const confirmed = window.confirm(
      `Delete ${course.code} — ${course.title}? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await deleteCourse(course.id);

      setCourses((previous) =>
        previous.filter((item) => item.id !== course.id),
      );

      setNotice("Course deleted successfully.");
      setError("");
    } catch {
      setError("Could not delete this course. Please try again.");
    }
  }

  const totalCredits = courses.reduce(
    (sum, course) => sum + (Number(course.credits) || 0),
    0,
  );

  const departmentsCount = new Set(
    courses.map((course) => course.department).filter(Boolean),
  ).size;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <i className="bi bi-mortarboard-fill" />
          </div>

          <div>
            <strong>CourseFlow</strong>
            <span>ACADEMIC PORTAL</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <button className="nav-item active">
          <i className="bi bi-grid-1x2-fill" />
          Dashboard
        </button>

        <button
          className="nav-item"
          onClick={() =>
            document
              .getElementById("courses-table")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <i className="bi bi-journal-bookmark-fill" />
          Courses
          <span className="nav-count">{courses.length}</span>
        </button>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <i className="bi bi-lightbulb-fill" />
            </div>

            <strong>Need a hand?</strong>
            <p>Manage your courses with ease.</p>
            <span>COURSEFLOW v1.0</span>
          </div>

          <div className="profile">
            <div className="avatar">AD</div>
            <div className="profile-info">
              <strong>Admin User</strong>
              <span>Administrator</span>
            </div>
            <i className="bi bi-three-dots" />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb-text">
            Workspace
            <i className="bi bi-chevron-right" />
            <strong>Dashboard</strong>
          </div>

          <div className="top-actions">
            <span className="status-pill">
              <span />
              System online
            </span>

            <button
              className="icon-button"
              title="Notifications"
              aria-label="Notifications"
            >
              <i className="bi bi-bell" />
            </button>

            <div className="top-avatar">AD</div>
          </div>
        </header>

        <section className="page-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">ACADEMIC OVERVIEW</div>
              <h1>
                Course dashboard <span>✦</span>
              </h1>
              <p className="subtitle">
                Manage your curriculum, courses, and academic records in one
                place.
              </p>
            </div>

            <button className="primary-button" onClick={openAdd}>
              <i className="bi bi-plus-lg" />
              Add new course
            </button>
          </div>

          {notice && (
            <div className="alert alert-success py-2">
              <i className="bi bi-check-circle me-2" />
              {notice}
              <button
                className="btn-close float-end"
                onClick={() => setNotice("")}
                aria-label="Dismiss"
              />
            </div>
          )}

          {error && !modalOpen && (
            <div className="alert alert-warning py-2">
              <i className="bi bi-exclamation-triangle me-2" />
              {error}
              <button
                className="btn btn-sm btn-outline-dark ms-2"
                onClick={loadCourses}
              >
                Retry
              </button>
            </div>
          )}

          <div className="stats-grid">
            <StatCard
              title="Total courses"
              value={loading ? "—" : courses.length}
              icon="bi-journal-richtext"
              color="purple"
              trend="Live data"
              foot="Registered courses"
            />

            <StatCard
              title="Total credit hours"
              value={loading ? "—" : totalCredits}
              icon="bi-clock-history"
              color="blue"
              trend="Calculated"
              foot="Across all courses"
            />

            <StatCard
              title="Departments"
              value={loading ? "—" : departmentsCount}
              icon="bi-buildings"
              color="orange"
              trend="Academic"
              foot="With registered courses"
            />

            <StatCard
              title="Showing results"
              value={loading ? "—" : visibleCourses.length}
              icon="bi-funnel"
              color="green"
              trend="Filtered view"
              foot="Matching your filters"
            />
          </div>

          <section className="table-card" id="courses-table">
            <div className="table-heading">
              <div>
                <h2>
                  All courses{" "}
                  <span className="count-badge">{courses.length}</span>
                </h2>
                <p>View and manage your registered academic courses.</p>
              </div>

              <button className="secondary-button" onClick={loadCourses}>
                <i className="bi bi-arrow-clockwise" />
                Refresh
              </button>
            </div>

            <div className="filters">
              <div className="search-box">
                <i className="bi bi-search" />

                <input
                  aria-label="Search courses"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by course, code, instructor..."
                />

                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                )}
              </div>

              <div className="select-wrap">
                <i className="bi bi-sliders" />

                <select
                  aria-label="Filter department"
                  value={departmentFilter}
                  onChange={(event) => setDepartmentFilter(event.target.value)}
                >
                  <option>All departments</option>
                  {departments.map((department) => (
                    <option key={department}>{department}</option>
                  ))}
                </select>

                <i className="bi bi-chevron-down select-arrow" />
              </div>
            </div>

            <div className="table-responsive">
              <table className="table course-table mb-0">
                <thead>
                  <tr>
                    <th>COURSE</th>
                    <th>DEPARTMENT</th>
                    <th>INSTRUCTOR</th>
                    <th>CREDITS</th>
                    <th className="text-end">ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5">
                        <div className="empty-state">
                          <div className="spinner-border spinner-border-sm text-primary me-2" />
                          Loading courses...
                        </div>
                      </td>
                    </tr>
                  ) : visibleCourses.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        <div className="empty-state">
                          <div className="empty-icon">
                            <i className="bi bi-journal-x" />
                          </div>

                          <strong>
                            {courses.length
                              ? "No matching courses"
                              : "Your course list is empty"}
                          </strong>

                          <p>
                            {courses.length
                              ? "Try changing your search or filters."
                              : "Add your first course to get started."}
                          </p>

                          {!courses.length && (
                            <button
                              className="primary-button small"
                              onClick={openAdd}
                            >
                              <i className="bi bi-plus-lg" />
                              Add a course
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    visibleCourses.map((course, index) => (
                      <tr key={course.id}>
                        <td>
                          <div className="course-cell">
                            <div
                              className={`course-symbol symbol-${index % 5}`}
                            >
                              <i
                                className={`bi ${
                                  [
                                    "bi-code-slash",
                                    "bi-database-fill",
                                    "bi-cpu-fill",
                                    "bi-shield-lock-fill",
                                    "bi-bar-chart-fill",
                                  ][index % 5]
                                }`}
                              />
                            </div>

                            <div>
                              <strong>
                                {String(course.title ?? "Untitled course")}
                              </strong>
                              <span>{String(course.code ?? "NO-CODE")}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="department-chip">
                            {course.department || "Unassigned"}
                          </span>
                        </td>

                        <td>
                          <div className="instructor-cell">
                            <div className="instructor-avatar">
                              {String(course.instructor || "NA")
                                .split(/\s+/)
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <span>{course.instructor || "Not assigned"}</span>
                          </div>
                        </td>

                        <td>
                          <span className="credits-pill">
                            <i className="bi bi-clock" />
                            {Number(course.credits) || 0} credits
                          </span>
                        </td>

                        <td>
                          <div className="actions-cell">
                            <button
                              className="action-btn edit"
                              title="Edit course"
                              aria-label="Edit course"
                              onClick={() => openEdit(course)}
                            >
                              <i className="bi bi-pencil-square" />
                            </button>

                            <button
                              className="action-btn delete"
                              title="Delete course"
                              aria-label="Delete course"
                              onClick={() => handleDelete(course)}
                            >
                              <i className="bi bi-trash3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>
                Showing <strong>{visibleCourses.length}</strong> of{" "}
                <strong>{courses.length}</strong> courses
              </span>

              <span className="footer-note">
                <i className="bi bi-shield-check" />
                Your records are stored in MySQL
              </span>
            </div>
          </section>

          <footer className="page-footer">
            © 2026 CourseFlow
            <span>
              Made for better academic management
              <i className="bi bi-heart-fill" />
            </span>
          </footer>
        </section>
      </main>

      {modalOpen && (
        <div
          className="modal-backdrop-custom"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className="course-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-head">
              <div>
                <div className="eyebrow">
                  {editing ? "UPDATE RECORD" : "NEW RECORD"}
                </div>

                <h2 id="modal-title">
                  {editing ? "Edit course" : "Add a new course"}
                </h2>

                <p>
                  {editing
                    ? "Update the information for this course."
                    : "Enter the course details below to add it to your curriculum."}
                </p>
              </div>

              <button
                className="close-modal"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="code">
                    Course code <b>*</b>
                  </label>
                  <input
                    id="code"
                    name="code"
                    value={form.code}
                    onChange={updateField}
                    placeholder="e.g. IS-401"
                    required
                    maxLength="30"
                  />
                </div>

                <div className="field">
                  <label htmlFor="credits">
                    Credit hours <b>*</b>
                  </label>
                  <select
                    id="credits"
                    name="credits"
                    value={form.credits}
                    onChange={updateField}
                    required
                  >
                    {Array.from({ length: 12 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1} {index === 0 ? "credit" : "credits"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field full">
                  <label htmlFor="title">
                    Course title <b>*</b>
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={updateField}
                    placeholder="e.g. Information Systems Security"
                    required
                    maxLength="120"
                  />
                </div>

                <div className="field">
                  <label htmlFor="department">Department</label>
                  <select
                    id="department"
                    name="department"
                    value={form.department}
                    onChange={updateField}
                  >
                    {departments.map((department) => (
                      <option key={department}>{department}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="instructor">Instructor</label>
                  <input
                    id="instructor"
                    name="instructor"
                    value={form.instructor}
                    onChange={updateField}
                    placeholder="e.g. Ahmad Rahimi"
                    maxLength="100"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving && (
                    <span className="spinner-border spinner-border-sm me-2" />
                  )}
                  {editing ? "Save changes" : "Create course"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, trend, foot }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className={`stat-icon ${color}`}>
          <i className={`bi ${icon}`} />
        </div>
      </div>

      <div className="stat-number">{value}</div>

      <div className="stat-foot">
        <span className={`trend ${color}-text`}>
          <i className="bi bi-check2-circle" />
          {trend}
        </span>
        <span>{foot}</span>
      </div>
    </div>
  );
}

export default App;
