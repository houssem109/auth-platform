"use client";

import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import type { AbacRule } from "./page";
import EditAbacModal from "./EditAbacModal";
import { toastSuccess } from "@/lib/toast";

type Props = {
  rules: AbacRule[];
  reload: () => void;
};

export default function AbacTable({ rules, reload }: Props) {
  const [selected, setSelected] = useState<AbacRule | null>(null);

  const handleDelete = async (rule: AbacRule) => {
    const ok = window.confirm(`Delete ABAC rule "${rule.name}"?`);
    if (!ok) return;

    await api.delete(`/abac-rules/${rule.id}`);
    toastSuccess("ABAC rule deleted");

    reload();
  };

  return (
    <>
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900 border-b border-slate-800">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Permission</th>
              <th className="px-3 py-2 text-left">Attribute</th>
              <th className="px-3 py-2 text-left">Operator</th>
              <th className="px-3 py-2 text-left">Effect</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr
                key={rule.id}
                className="border-b border-slate-800 hover:bg-slate-900"
              >
                <td className="px-3 py-2 font-medium">{rule.name}</td>
                <td className="px-3 py-2">{rule.permissionName}</td>
                <td className="px-3 py-2">{rule.attribute}</td>
                <td className="px-3 py-2">{rule.operator}</td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-md ${
                      rule.effect === "deny"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {rule.effect}
                  </span>
                </td>
                <td className="px-3 py-2 space-x-2">
                  <button
                    onClick={() => setSelected(rule)}
                    className="px-3 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(rule)}
                    className="px-3 py-1 text-xs rounded-md bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {rules.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-slate-500 py-4 text-sm"
                >
                  No ABAC rules yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <EditAbacModal rule={selected} close={() => setSelected(null)} reload={reload} />
      )}
    </>
  );
}