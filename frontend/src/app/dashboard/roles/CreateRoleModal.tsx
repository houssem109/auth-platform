"use client";

import { useState } from "react";
import api from "@/lib/api";
import { toastSuccess } from "@/lib/toast";
import Spinner from "@/components/Spinner";

type Props = {
  close: () => void;
  reload: () => Promise<void> | void;
};

export default function CreateRoleModal({ close, reload }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
    await api.post("/roles", { name, description });
    toastSuccess("Role created");
    await reload();
    close();
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-700 p-5">
        <h2 className="text-lg font-semibold mb-3">Create Role</h2>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs mb-1">Name</label>
            <input
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="manager, admin, support..."
            />
          </div>

          <div>
            <label className="block text-xs mb-1">Description</label>
            <input
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <button
            onClick={close}
            className="px-3 py-2 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 text-xs rounded-md bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-60"
          >
            {saving ?  <Spinner /> : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
