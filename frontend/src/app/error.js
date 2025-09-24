"use client";
export default function GlobalError({ error, reset }) {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{error?.message}</pre>
      <button className="bg-black text-white rounded px-4 py-2" onClick={() => reset()}>Try again</button>
    </div>
  );
}


