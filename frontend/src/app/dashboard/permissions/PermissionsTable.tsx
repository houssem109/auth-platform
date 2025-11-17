"use client";

import { PenLine, Trash2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import type { Permission } from "./page";
import EditPermissionModal from "./EditPermissionModal";
import { toastSuccess } from "@/lib/toast";

type Props = {
  permissions: Permission[];
  reload: () => Promise<void> | void;
};

// Treat core permissions as "system" (locked)
function isSystemPermission(name: string): boolean {
  return (
    name.startsWith("user.") ||
    name.startsWith("role.") ||
    name.startsWith("permission.") ||
    name.startsWith("audit.") ||
    name.startsWith("abac.")
  );
}

export default function PermissionsTable({ permissions, reload }: Props) {
  const [selected, setSelected] = useState<Permission | null>(null);

  const handleDelete = async (perm: Permission) => {

    if (!confirm(  `Delete permission "${perm.name}"? This may affect roles using it.`)) return;

      await api.delete(`/permissions/${perm.id}`);
      toastSuccess("Permission deleted");

      await reload();
    
  };

  return (
    <>
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/80 border-b border-slate-800">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">
                Description
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">
                Type
              </th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-slate-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm, index) => {
              const system = isSystemPermission(perm.name);
              return (
                <tr
                  key={perm.id}
                  className={`border-b border-slate-800/60 ${
                    index % 2 === 0 ? "bg-slate-950" : "bg-slate-950/80"
                  } hover:bg-slate-900/80 transition-colors`}
                >
                  <td className="px-4 py-2 font-mono text-xs text-slate-100">
                    {perm.name}
                  </td>
                  <td className="px-4 py-2 text-slate-300">
                    {perm.description || "-"}
                  </td>
                  <td className="px-4 py-2">
                    {system ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/40">
                        <ShieldCheck className="h-3 w-3" />
                        system
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-200 border border-slate-600/80">
                        custom
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right space-x-1">
                    <button
                      onClick={() => setSelected(perm)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-100"
                    >
                      <PenLine className="h-3 w-3" />
                      Edit
                    </button>

                    {!system && (
                      <button
                        onClick={() => handleDelete(perm)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] bg-red-500/90 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {permissions.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-slate-500 text-xs"
                >
                  No permissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <EditPermissionModal
          permission={selected}
          close={() => setSelected(null)}
          reload={reload}
        />
      )}
    </>
  );
}
