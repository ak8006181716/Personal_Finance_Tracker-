import api from "../lib/axios";

export async function listBudgets() {
  const { data } = await api.get("/budgets");
  return data;
}

export async function upsertBudget(payload) {
  const { data } = await api.post("/budgets", payload);
  return data;
}


