"use client";
import { useState } from "react";

export default function ReportsPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiBase, setApiBase] = useState("");

  async function runReports(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, apiBase: "http://localhost:5000/api"  || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to run reports");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Generate Reports</h1>
      <form onSubmit={runReports} className="space-y-3">
        <input className="border rounded px-3 py-2 w-full" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input className="border rounded px-3 py-2 w-full" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        
        <button className="bg-black text-white rounded px-4 py-2" disabled={loading}>{loading ? "Running…" : "Run Reports"}</button>
      </form>
      {error ? <p className="text-red-600">{error}</p> : null}
      {result ? (
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
      ) : null}
      <p className="text-sm text-gray-600">Reports will be written to the local <code>reports</code> folder.</p>
    </div>
  );
}


