"use client";

import { useState } from "react";
import api from "@/lib/api";
import type { AutomationRule } from "./page";
import {
  Trash2,
  Pencil,
  ToggleLeft,
  ToggleRight,
  PlayCircle,
} from "lucide-react";
import EditAutomationModal from "./EditAutomationModal";
import { toast } from "sonner";
import { toastSuccess } from "@/lib/toast";

type Props = {
  rules: AutomationRule[];
  reload: () => void | Promise<void>;
};

export default function AutomationTable({ rules, reload }: Props) {
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const handleDelete = async (rule: AutomationRule) => {
    if (!window.confirm(`Delete rule "${rule.name}"?`)) return;

    await api.delete(`/automation/rules/${rule.id}`);
    toastSuccess("Automation rule deleted");

    await reload();
  };

  const handleTrigger = async (event: string) => {
    const t = toast.loading("Processing trigger...");

    try {
      await api.post("/automation/trigger/test", { event });

      toast.success("Trigger executed!", {
        id: t,
        description: `Event "${event}" was processed successfully.`,
      });
    } catch (err) {
      console.error(err);

      toast.error("Trigger failed", {
        id: t,
        description: "Unable to execute the automation.",
      });
    }
  };

  return (
    <>
      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900 border-b border-slate-800">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Event</th>
              <th className="px-3 py-2">Target URL</th>
              <th className="px-3 py-2">Enabled</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} className="border-b border-slate-800">
                <td className="px-3 py-2">{rule.name}</td>
                <td className="px-3 py-2 text-purple-300">{rule.event}</td>
                <td className="px-3 py-2 text-blue-300">{rule.targetUrl}</td>
                <td className="px-3 py-2">
                  {rule.enabled ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ToggleRight className="w-5 h-5" /> Enabled
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400">
                      <ToggleLeft className="w-5 h-5" /> Disabled
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 space-x-2">
                  <button
                    onClick={() => setEditingRule(rule)}
                    className="inline-flex items-center px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-md"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleTrigger(rule.event)}
                    className="inline-flex items-center px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                  >
                    <PlayCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(rule)}
                    className="inline-flex items-center px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {rules.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-slate-500">
                  No automation rules yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingRule && (
        <EditAutomationModal
          rule={editingRule}
          close={() => setEditingRule(null)}
          reload={reload}
        />
      )}
    </>
  );
}
