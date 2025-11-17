"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Role } from "./page";
import { toastSuccess } from "@/lib/toast";

type Permission = {
  id: string;
  name: string;
  description: string | null;
};

type Props = {
  role: Role;
  close: () => void;
  reload: () => Promise<void> | void;
};

export default function AssignPermissionsModal({ role, close, reload }: Props) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<Permission[]>("/permissions");
        setPermissions(res.data);

        const current =
          role.rolePermissions?.map((rp) => rp.permissionId) || [];
        setSelectedIds(current);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [role]);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const save = async () => {
    try {
      setSaving(true);
      await api.post(`/roles/${role.id}/permissions`, {
        permissionIds: selectedIds,
      });
        toastSuccess("Permissions updated");
      await reload();
      close();
  } finally {
    setSaving(false);
  }
};

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
      onClick={close} // clicking outside closes modal
    >
      <div
        className="w-full max-w-lg rounded-xl bg-slate-900 border border-slate-700 p-5"
        onClick={(e) => e.stopPropagation()} // prevent bubbling → FIX
      >
        <h2 className="text-lg font-semibold mb-2">
          Permissions for <span className="text-emerald-400">{role.name}</span>
        </h2>
        <p className="text-xs text-slate-400 mb-3">
          Check which permissions this role should have.
        </p>

        <div className="max-h-72 overflow-y-auto border border-slate-800 rounded-lg p-3 space-y-2">
          {permissions.map((perm) => (
            <label
              key={perm.id}
              className="flex items-start gap-2 text-sm text-slate-200"
            >
              <input
                type="checkbox"
                className="mt-0.5"
                checked={selectedIds.includes(perm.id)}
                onChange={() => toggle(perm.id)}
              />
              <div>
                <div className="font-medium">{perm.name}</div>
                {perm.description && (
                  <div className="text-xs text-slate-400">
                    {perm.description}
                  </div>
                )}
              </div>
            </label>
          ))}

          {permissions.length === 0 && (
            <p className="text-xs text-slate-500">No permissions defined.</p>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation(); // FIX
              close();
            }}
            className="px-3 py-2 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100"
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
            className="px-4 py-2 text-xs rounded-md bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
