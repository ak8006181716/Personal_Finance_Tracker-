export default function Home() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden shadow-sm border">
        <div className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 p-10 text-white">
          <h1 className="text-3xl sm:text-4xl font-semibold">Track budgets and expenses with ease</h1>
          <p className="text-white/90 text-sm sm:text-base mt-2 max-w-2xl">Create budgets, add expenses, and see insights on your dashboard. Stay in control of your money.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/dashboard" className="bg-white text-gray-900 rounded px-5 py-2 text-sm font-medium hover:bg-white/90">Go to Dashboard</a>
            <a href="/budgets" className="border border-white/70 text-white rounded px-5 py-2 text-sm font-medium hover:bg-white/10">Manage Budgets</a>
            <a href="/expenses" className="border border-white/70 text-white rounded px-5 py-2 text-sm font-medium hover:bg-white/10">Add Expenses</a>
          </div>
        </div>
        {/* Highlights */}
        <div className="px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Budgets</div>
            <div className="font-medium">Set monthly limits by category</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Expenses</div>
            <div className="font-medium">Capture spending with notes and methods</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Reports</div>
            <div className="font-medium">Generate CSV summaries anytime</div>
          </div>
        </div>
      </div>
    </div>
  );
}
