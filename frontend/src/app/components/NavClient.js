"use client";
import Link from "next/link";
import { logout, getProfile } from "@/services/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavClient() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const isPublic = pathname === "/login" || pathname === "/register";
    if (!isPublic) {
      getProfile()
        .then(() => { if (mounted) setAuthed(true); })
        .catch(() => { if (mounted) setAuthed(false); });
    } else {
      if (mounted) setAuthed(false);
    }
    return () => { mounted = false; };
  }, [pathname]);

  async function handleLogout() {
    try { await logout(); } catch (e) {}
    router.push("/login");
  }

  return (
    <nav className="px-4 py-3 border-b">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        <Link href="/" className="font-semibold text-lg">BudgetPro</Link>
        <div className="hidden sm:flex gap-3">
          <Link href="/dashboard" className={`px-3 py-1 rounded hover:bg-gray-100 ${pathname.startsWith('/dashboard') ? 'underline' : ''}`}>Dashboard</Link>
          <Link href="/budgets" className={`px-3 py-1 rounded hover:bg-gray-100 ${pathname.startsWith('/budgets') ? 'underline' : ''}`}>Budgets</Link>
          <Link href="/expenses" className={`px-3 py-1 rounded hover:bg-gray-100 ${pathname.startsWith('/expenses') ? 'underline' : ''}`}>Expenses</Link>
          <Link href="/profile" className={`px-3 py-1 rounded hover:bg-gray-100 ${pathname.startsWith('/profile') ? 'underline' : ''}`}>Profile</Link>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {!authed ? (<>
            <Link href="/login" className={`px-3 py-1 rounded border hover:bg-gray-50 ${pathname === '/login' ? 'underline' : ''}`}>Login</Link>
            <Link href="/register" className={`px-3 py-1 rounded bg-black text-white hover:opacity-90 ${pathname === '/register' ? 'underline' : ''}`}>Sign up</Link>
          </>) : (
            <button onClick={handleLogout} className="px-3 py-1 rounded border hover:bg-gray-50">Logout</button>
          )}
        </div>
      </div>
    </nav>
  );
}


