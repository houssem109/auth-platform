"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { setEmail: saveEmail } = useAuth();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    saveEmail(email);
    router.push("/dashboard/users");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <h1 className="text-xl font-semibold">Authorization Platform</h1>
        <p className="text-sm text-slate-400 mb-6">
          Fake Login — enter a valid backend email.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 mt-1 text-sm"
              placeholder="superadmin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 py-2 rounded-lg text-white text-sm"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
