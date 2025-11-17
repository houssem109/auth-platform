"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/roles", label: "Roles" },
  { href: "/dashboard/permissions", label: "Permissions" },
  { href: "/dashboard/abac", label: "ABAC Rules" },
  { href: "/dashboard/import", label: "CSV Import" },
  { href: "/dashboard/metrics", label: "Metrics" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/automation", label: "Automation" },
  { href: "/dashboard/system-errors", label: "System Errors" },

];

export default function Sidebar() {
  const pathname = usePathname();
  const { email, setEmail } = useAuth();
  const router = useRouter();

  return (
    <div className="h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <h1 className="font-semibold text-lg">Auth Platform</h1>
        <p className="text-xs text-slate-400">{email}</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {links.map((l) => {
          const active = pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block px-3 py-2 rounded-md text-sm ${
                active
                  ? "bg-slate-800 text-emerald-400"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              {l.label}
            </Link>
            
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => {
            setEmail(null);
            router.push("/login");
          }}
          className="w-full text-sm py-2 bg-slate-800 hover:bg-slate-700 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
