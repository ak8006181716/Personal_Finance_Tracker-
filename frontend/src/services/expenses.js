import api from "../lib/axios";

export async function listExpenses(query="") {
  const { data } = await api.get(`/expences${query}`);
  return data;
}

export async function createExpense(payload) {
  const { data } = await api.post("/expences", payload);
  return data;
}

export async function updateExpense(id, payload) {
  const { data } = await api.put(`/expences/${id}`, payload);
  return data;
}

export async function deleteExpense(id) {
  const { data } = await api.delete(`/expences/${id}`);
  return data;
}


