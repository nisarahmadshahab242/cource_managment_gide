import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getCourses = async () => {
  const response = await API.get("/courses");
  return response.data;
};

export const getCourseById = async (id) => {
  const response = await API.get(`/courses/${id}`);
  return response.data;
};

export const createCourse = async (course) => {
  const response = await API.post("/courses", course);
  return response.data;
};

export const updateCourse = async (id, course) => {
  const response = await API.put(`/courses/${id}`, course);
  return response.data;
};

export const deleteCourse = async (id) => {
  const response = await API.delete(`/courses/${id}`);
  return response.data;
};
