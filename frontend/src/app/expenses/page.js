"use client";
import { useEffect, useState } from "react";
import { listExpenses, createExpense, deleteExpense, updateExpense } from "@/services/expenses";

export default function ExpensesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ amount: "", category: "", date: "", paymentMethod: "", notes: "" });
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", category: "", paymentMethod: "", startDate: "", endDate: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ amount: "", category: "", date: "", paymentMethod: "", notes: "" });
  const [loading, setLoading] = useState(false);

  async function refresh() {
    try {
      setLoading(true);
      const query = new URLSearchParams(Object.entries(filters).filter(([,v])=>v)).toString();
      const d = await listExpenses(query ? `?${query}` : "");
      setItems(d?.data?.expenses || d?.expenses || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await createExpense({ ...form, amount: Number(form.amount) });
      setForm({ amount: "", category: "", date: "", paymentMethod: "", notes: "" });
      refresh();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create expense");
    }
  }

  function startEdit(it){
    setEditingId(it._id);
    setEditForm({ amount: it.amount || "", category: it.category || "", date: (it.date||"").slice(0,10), paymentMethod: it.paymentMethod || "", notes: it.notes || "" });
  }

  async function saveEdit(e){
    e.preventDefault();
    try{ await updateExpense(editingId, editForm); setEditingId(null); refresh(); }catch(err){ setError(err?.response?.data?.message || "Failed to update expense"); }
  }

  const totalAmount = items.reduce((s, it) => s + Number(it.amount || 0), 0);
  const categoryCount = new Set(items.map((it) => it.category)).size;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="rounded-2xl overflow-hidden shadow-sm border">
        <div className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 p-6 text-white">
          <h1 className="text-2xl font-semibold">Expenses</h1>
          <p className="text-white/90 text-sm mt-1">Track and manage your spending.</p>
        </div>
        {/* Stats */}
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Spent</div>
            <div className="font-medium">{totalAmount}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Expenses Count</div>
            <div className="font-medium">{items.length}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Categories</div>
            <div className="font-medium">{categoryCount}</div>
          </div>
        </div>
      </div>

      {error ? <p className="text-red-600">{error}</p> : null}

      {/* Filters */}
      <div className="border rounded-2xl p-5">
        <h2 className="text-lg font-medium mb-3">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Search" value={filters.q} onChange={(e)=>setFilters({...filters,q:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="Category" value={filters.category} onChange={(e)=>setFilters({...filters,category:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="Payment" value={filters.paymentMethod} onChange={(e)=>setFilters({...filters,paymentMethod:e.target.value})} />
          <input className="border rounded px-3 py-2" type="date" value={filters.startDate} onChange={(e)=>setFilters({...filters,startDate:e.target.value})} />
          <input className="border rounded px-3 py-2" type="date" value={filters.endDate} onChange={(e)=>setFilters({...filters,endDate:e.target.value})} />
          <button type="button" onClick={refresh} disabled={loading} className="sm:col-span-5 bg-gray-900 text-white rounded py-2 disabled:opacity-60 hover:opacity-90">{loading ? 'Loading…' : 'Apply Filters'}</button>
        </div>
      </div>

      {/* Create */}
      <div className="border rounded-2xl p-5">
        <h2 className="text-lg font-medium mb-3">Add Expense</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Amount" value={form.amount} onChange={(e)=>setForm({...form, amount:e.target.value})} required />
          <input className="border rounded px-3 py-2" placeholder="Category" value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} required />
          <input className="border rounded px-3 py-2" type="date" value={form.date} onChange={(e)=>setForm({...form, date:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="Payment" value={form.paymentMethod} onChange={(e)=>setForm({...form, paymentMethod:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="Notes" value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} />
          <button className="sm:col-span-5 bg-black text-white rounded py-2 hover:opacity-90">Add Expense</button>
        </form>
      </div>

      <div className="text-sm text-gray-600">{!error ? (loading ? 'Loading…' : `${items.length} item(s)`) : null}</div>
      <ul className="space-y-2">
        {items.length === 0 && !error ? (
          <li className="text-gray-500">No expenses found.</li>
        ) : null}
        {items.map((it) => (
          <li key={it._id} className="border rounded-xl p-4 space-y-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-base">{it.category}</div>
                <div className="text-2xl font-semibold mt-1">{it.amount}</div>
                <div className="text-sm text-gray-600">{it.date?.slice?.(0,10)} {it.paymentMethod ? `· ${it.paymentMethod}` : ""} {it.notes ? `· ${it.notes}` : ""}</div>
              </div>
              {editingId !== it._id ? (
                <div className="flex gap-3">
                  <button onClick={()=>startEdit(it)} className="px-3 py-1 rounded border border-blue-600 text-blue-600 hover:bg-blue-50">Edit</button>
                  <button onClick={() => deleteExpense(it._id).then(refresh)} className="px-3 py-1 rounded border border-red-600 text-red-600 hover:bg-red-50">Delete</button>
                </div>
              ) : null}
            </div>

            {editingId === it._id ? (
              <form onSubmit={saveEdit} className="rounded-lg border bg-gray-50 p-4 grid grid-cols-1 sm:grid-cols-6 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs text-gray-600 mb-1">Amount</label>
                  <input className="w-full border rounded px-2 py-1" placeholder="Amount" value={editForm.amount} onChange={(e)=>setEditForm({...editForm, amount:e.target.value})} />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs text-gray-600 mb-1">Category</label>
                  <input className="w-full border rounded px-2 py-1" placeholder="Category" value={editForm.category} onChange={(e)=>setEditForm({...editForm, category:e.target.value})} />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs text-gray-600 mb-1">Date</label>
                  <input className="w-full border rounded px-2 py-1" type="date" value={editForm.date} onChange={(e)=>setEditForm({...editForm, date:e.target.value})} />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs text-gray-600 mb-1">Payment</label>
                  <input className="w-full border rounded px-2 py-1" placeholder="Payment" value={editForm.paymentMethod} onChange={(e)=>setEditForm({...editForm, paymentMethod:e.target.value})} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Notes</label>
                  <input className="w-full border rounded px-2 py-1" placeholder="Notes" value={editForm.notes} onChange={(e)=>setEditForm({...editForm, notes:e.target.value})} />
                </div>
                <div className="sm:col-span-6 flex gap-2 justify-end">
                  <button className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Save</button>
                  <button type="button" onClick={()=>setEditingId(null)} className="px-4 py-2 rounded border">Cancel</button>
                </div>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}


