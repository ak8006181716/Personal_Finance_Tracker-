"use client";
import { useEffect, useMemo, useState } from "react";
import { listExpenses } from "@/services/expenses";
import { listBudgets } from "@/services/budgets";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import dynamic from 'next/dynamic';
const Pie = dynamic(() => import('react-chartjs-2').then(m => m.Pie), { ssr: false });
const Line = dynamic(() => import('react-chartjs-2').then(m => m.Line), { ssr: false });

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

function startOfMonth(d){ const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x; }
function endOfMonth(d){ const x = new Date(d); x.setMonth(x.getMonth()+1,0); x.setHours(23,59,59,999); return x; }

export default function DashboardPage(){
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function load(){
      try{
        const [e,b] = await Promise.all([listExpenses(), listBudgets()]);
        const eItems = e?.data?.expenses || e?.data?.items || e?.expenses || e?.items || [];
        const bItems = b?.data?.budgets || b?.budgets || [];
        setExpenses(eItems);
        setBudgets(bItems);
      }catch(err){ setError(err?.response?.data?.message || err?.message || 'Failed to load'); }
    }
    load();
  }, []);

  useEffect(() => { setMounted(true); }, []);

  const { totalThisMonth, categoryTotals, topCategory, paymentTotals, lineSeries, labels } = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now); const end = endOfMonth(now);
    const inMonth = expenses.filter(e=>{ const d=new Date(e.date||0); return d>=start && d<=end; });
    const total = inMonth.reduce((s,x)=>s + Number(x.amount||0), 0);
    const catTotals = {};
    const payTotals = {};
    inMonth.forEach(x=>{
      const c = x.category || 'Uncategorized';
      const p = x.paymentMethod || 'Unknown';
      catTotals[c]=(catTotals[c]||0)+Number(x.amount||0);
      payTotals[p]=(payTotals[p]||0)+Number(x.amount||0);
    });
    let topCat = { name: '-', amount: 0 };
    Object.entries(catTotals).forEach(([k,v])=>{ if(v>topCat.amount) topCat={name:k, amount:v}; });

    // Line by date (current month)
    const dayMap = {};
    for(let d = new Date(start); d<=end; d.setDate(d.getDate()+1)){
      dayMap[d.toISOString().slice(0,10)] = 0;
    }
    inMonth.forEach(x=>{ const key=(x.date||'').slice(0,10); if(key in dayMap){ dayMap[key]+=Number(x.amount||0);} });
    const lbls = Object.keys(dayMap);
    const series = Object.values(dayMap);

    return { totalThisMonth: total, categoryTotals: catTotals, topCategory: topCat, paymentTotals: payTotals, lineSeries: series, labels: lbls };
  }, [expenses]);

  const pieData = useMemo(()=>({
    labels: Object.keys(categoryTotals||{}),
    datasets: [{ data: Object.values(categoryTotals||{}), backgroundColor: ['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#22c55e','#f97316'] }]
  }),[categoryTotals]);

  const lineData = useMemo(()=>({
    labels,
    datasets: [{ label: 'Spend', data: lineSeries, borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.2)' }]
  }),[labels, lineSeries]);

  const topPayments = useMemo(() => Object.entries(paymentTotals||{}).sort((a,b)=>Number(b[1]||0)-Number(a[1]||0)).slice(0,3), [paymentTotals]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="rounded-2xl overflow-hidden shadow-sm border">
        <div className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="text-white/90 text-sm mt-1">Overview of your budgets and expenses this month.</p>
            </div>
            <form onSubmit={async (e)=>{ e.preventDefault(); try{ await fetch('/api/reports',{ method:'POST' }); alert('Report generated to reports/'); }catch(err){ alert('Failed to generate report'); } }}>
              <button className="bg-white text-gray-900 rounded px-4 py-2 text-sm font-medium hover:bg-white/90">Create Report</button>
            </form>
          </div>
        </div>
        {error ? <p className="text-red-600 px-6 py-3">{error}</p> : null}
        {/* Stats */}
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Total This Month</div>
            <div className="text-2xl font-bold">{totalThisMonth?.toFixed?.(2) || 0}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Top Category</div>
            <div className="text-2xl font-bold">{topCategory?.name} ({topCategory?.amount?.toFixed?.(2) || 0})</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Top Payment Methods</div>
            <div className="text-sm">{topPayments.map(([k,v])=>`${k} (${Number(v||0).toFixed(0)})`).join(', ') || '-'}</div>
          </div>
        </div>
        {/* Quick Links */}
        <div className="px-6 pb-6 flex flex-wrap gap-3">
          <a href="/budgets" className="px-4 py-2 rounded border hover:bg-gray-50">Manage Budgets</a>
          <a href="/expenses" className="px-4 py-2 rounded border hover:bg-gray-50">View Expenses</a>
          <a href="/profile" className="px-4 py-2 rounded border hover:bg-gray-50">Your Profile</a>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-2xl p-4"><h2 className="font-medium mb-2">Category-wise Spending</h2>{mounted ? <Pie data={pieData} /> : null}</div>
        <div className="border rounded-2xl p-4"><h2 className="font-medium mb-2">Spending Over Time (This Month)</h2>{mounted ? <Line data={lineData} /> : null}</div>
      </div>
    </div>
  );
}


