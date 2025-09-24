"use client";
import { useEffect, useState } from "react";
import { listBudgets, upsertBudget } from "@/services/budgets";

export default function BudgetsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ category: "", month: "", amount: "" });
  const [updateForm, setUpdateForm] = useState({ category: "", month: "", amount: "" });
  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState({});

  async function refresh() {
    try {
      const d = await listBudgets();
      // Backend wraps payload as { data: { budgets } }
      setItems(d?.data?.budgets || d?.budgets || d || []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load budgets");
    }
  }

  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    // Compute alerts comparing month+category budget to expenses
    // This simple client-side version uses budgets only; for accuracy join with expenses on server
    const next = {};
    items.forEach(b => {
      const spent = 0; 
      const usage = b.amount ? (spent / Number(b.amount)) : 0;
      if (usage >= 1) next[b._id] = '100% of budget reached';
      else if (usage >= 0.8) next[b._id] = '80% of budget reached';
    });
    setAlerts(next);
  }, [items]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await upsertBudget(form);
      setForm({ category: "", month: "", amount: "" });
      refresh();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save budget");
    }
  }

  async function handleUpdateSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await upsertBudget(updateForm);
      setUpdateForm({ category: "", month: "", amount: "" });
      refresh();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update budget");
    }
  }

  function handleEditClick(b) {
    setUpdateForm({
      category: b.category || "",
      month: b.month || "",
      amount: String(b.amount ?? ""),
    });
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="rounded-2xl overflow-hidden shadow-sm border">
        <div className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 p-6 text-white">
          <h1 className="text-2xl font-semibold">Budgets</h1>
          <p className="text-white/90 text-sm mt-1">Create and update monthly category budgets.</p>
        </div>
        {/* Stats */}
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Budgets Count</div>
            <div className="font-medium">{items.length}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Budgeted</div>
            <div className="font-medium">{items.reduce((s, b) => s + Number(b.amount || 0), 0)}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Alerts</div>
            <div className="font-medium">{Object.values(alerts).length}</div>
          </div>
        </div>
      </div>
      {error ? <p className="text-red-600">{error}</p> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-2xl p-5">
          <h2 className="text-lg font-medium mb-3">Create Budget</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input className="border rounded px-3 py-2" placeholder="Category" value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} required />
            <input className="border rounded px-3 py-2" placeholder="Month (YYYY-MM)" value={form.month} onChange={(e)=>setForm({...form, month:e.target.value})} required />
            <input className="border rounded px-3 py-2" placeholder="Amount" value={form.amount} onChange={(e)=>setForm({...form, amount:e.target.value})} required />
            <button className="sm:col-span-3 bg-black text-white rounded py-2 hover:opacity-90">Save</button>
          </form>
        </div>
        <div className="border rounded-2xl p-5">
          <h2 className="text-lg font-medium mb-3">Update Budget</h2>
          <form onSubmit={handleUpdateSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input className="border rounded px-3 py-2" placeholder="Category" value={updateForm.category} onChange={(e)=>setUpdateForm({...updateForm, category:e.target.value})} required />
            <input className="border rounded px-3 py-2" placeholder="Month (YYYY-MM)" value={updateForm.month} onChange={(e)=>setUpdateForm({...updateForm, month:e.target.value})} required />
            <input className="border rounded px-3 py-2" placeholder="New Amount" value={updateForm.amount} onChange={(e)=>setUpdateForm({...updateForm, amount:e.target.value})} required />
            <button className="sm:col-span-3 bg-gray-900 text-white rounded py-2 hover:opacity-90">Update</button>
          </form>
          <p className="text-sm text-gray-600 mt-2">Tip: pick an item below and click Edit to prefill.</p>
        </div>
      </div>

      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it._id} className="border rounded-xl p-4 flex items-center justify-between gap-3 hover:shadow-sm transition-shadow">
            <div>
              <div className="font-medium text-base">{it.category}</div>
              <div className="text-2xl font-semibold mt-1">{it.amount}</div>
              <div className="text-sm text-gray-600">{it.month}</div>
              {alerts[it._id] ? <div className="text-xs text-red-600">{alerts[it._id]}</div> : null}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleEditClick(it)} className="text-sm underline">Edit</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


