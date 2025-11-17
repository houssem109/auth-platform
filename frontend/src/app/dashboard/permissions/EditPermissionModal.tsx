"use client";

import { useState } from "react";
import api from "@/lib/api";
import type { Permission } from "./page";
import { KeyRound } from "lucide-react";
import { toastSuccess } from "@/lib/toast";
import Spinner from "@/components/Spinner";

type Props = {
  permission: Permission;
  close: () => void;
  reload: () => Promise<void> | void;
};

export default function EditPermissionModal({
  permission,
  close,
  reload,
}: Props) {
  const [name, setName] = useState(permission.name);
  const [description, setDescription] = useState(
    permission.description || ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSystem =
    permission.name.startsWith("user.") ||
    permission.name.startsWith("role.") ||
    permission.name.startsWith("permission.") ||
    permission.name.startsWith("audit.") ||
    permission.name.startsWith("abac.");

  const save = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setSaving(true);

      await api.put(`/permissions/${permission.id}`, {
        name: isSystem ? permission.name : name.trim(), // lock name for system
        description: description.trim() || null,
      });
toastSuccess("Permission updated");

      await reload();
      close();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
      onClick={close}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-purple-500/20 flex items-center justify-center">
            <KeyRound className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Edit Permission</h2>
            <p className="text-[11px] text-slate-400">
              {isSystem
                ? "System permissions have a locked name."
                : "You can rename or adjust this permission."}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-[11px] mb-1 text-slate-300">
              Name
            </label>
            <input
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSystem}
            />
          </div>

          <div>
            <label className="block text-[11px] mb-1 text-slate-300">
              Description
            </label>
            <textarea
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm resize-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          {error && (
            <p className="text-[11px] text-red-400">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="px-3 py-2 text-xs rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              save();
            }}
            disabled={saving}
            className="px-4 py-2 text-xs rounded-full bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-60"
          >
            {saving ?  <Spinner /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}