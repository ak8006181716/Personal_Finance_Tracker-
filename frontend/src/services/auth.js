import api from "../lib/axios";

export async function register(payload) {
  const { data } = await api.post("/users/register", payload);
  return data;
}

export async function login(payload) {
  const { data } = await api.post("/users/login", payload);
  return data;
}

export async function logout() {
  const { data } = await api.post("/users/logout");
  return data;
}

export async function getProfile() {
  const { data } = await api.get("/users/profile");
  return data;
}


