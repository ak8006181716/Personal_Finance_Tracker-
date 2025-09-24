"use client";
import { useEffect, useState } from "react";
import { getProfile, logout } from "@/services/auth";
import { useRouter } from "next/navigation";
import { listBudgets } from "@/services/budgets";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [budgets, setBudgets] = useState([]);
  const [budgetsError, setBudgetsError] = useState("");
  const router = useRouter();

  useEffect(() => {
    getProfile()
      .then((d) => setProfile(d?.user || d?.data?.user || d?.data || d))
      .catch((e) => setError(e?.response?.data?.message || "Failed to load profile"));
    listBudgets()
      .then((d) => {
        const items = d?.data?.budgets || d?.budgets || d || [];
        setBudgets(Array.isArray(items) ? items : []);
        setBudgetsError("");
      })
      .catch((e) => {
        const msg = e?.response?.data?.message || e?.message || "Failed to load budgets";
        setBudgetsError(msg);
      });
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } catch (e) {}
    router.push("/login");
  }

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  function getInitials(name) {
    if (!name) return "U";
    const parts = String(name).trim().split(" ");
    const first = parts[0]?.[0] || "";
    const last = parts[1]?.[0] || "";
    return (first + last).toUpperCase() || first.toUpperCase() || "U";
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="rounded-2xl overflow-hidden shadow-sm border">
        <div className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-semibold">
              {getInitials(profile?.name)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">{profile?.name || 'Your Profile'}</h1>
              <p className="text-white/90 text-sm">{profile?.email || '—'}</p>
            </div>
            <button onClick={handleLogout} className="bg-white text-gray-900 rounded px-4 py-2 text-sm font-medium hover:bg-white/90">Logout</button>
          </div>
        </div>
        {error ? <p className="text-red-600 px-6 py-3">{error}</p> : null}
        {/* Details */}
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Name</div>
            <div className="font-medium break-all">{profile?.name || '-'}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Budgets Count</div>
            <div className="font-medium">{budgets.length}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Budgeted</div>
            <div className="font-medium">{totalBudget}</div>
          </div>
        </div>
      </div>

      {/* Budgets */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Budgets</h2>
          <button onClick={() => router.push('/budgets')} className="text-sm underline">Manage Budgets</button>
        </div>
        {budgetsError ? <p className="text-sm text-red-600 mb-2">{budgetsError}</p> : null}
        {budgets.length === 0 ? (
          <div className="border rounded-xl p-6 text-center text-gray-600">
            No budgets yet. Create one on the Budgets page.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b) => (
              <div key={b._id} className="border rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-baseline justify-between">
                  <div className="font-medium">{b.category}</div>
                  <div className="text-sm text-gray-500">{b.month}</div>
                </div>
                <div className="mt-2 text-2xl font-semibold">{b.amount}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!profile ? (
        <p className="mt-6">Loading...</p>
      ) : null}
    </div>
  );
}


