"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toastSuccess, toastError } from "@/lib/toast";
import type { User } from "./page";

type Role = {
  id: string;
  name: string;
  description: string | null;
};

type Props = {
  user: User;
  close: () => void;
  reload: () => void | Promise<void>;
};

export default function AssignRolesModal({ user, close, reload }: Props) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get("/roles");
        setRoles(r.data);

        const ur = await api.get(`/users/${user.id}/roles`);
        setSelected(ur.data.map((x: any) => x.roleId));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [user]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const save = async () => {
    try {
      setSaving(true);
      await api.post(`/users/${user.id}/roles`, { roleIds: selected });
      toastSuccess("Roles updated");
      await reload();
      close();
    } catch (err) {
      console.error(err);
      toastError("Failed to assign roles");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-3">
          Assign Roles — {user.email}
        </h2>

        <div className="max-h-72 overflow-y-auto border border-slate-800 rounded-lg p-3 space-y-2">
          {roles.map((role) => (
            <label key={role.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(role.id)}
                onChange={() => toggle(role.id)}
              />
              <span className="text-slate-200">{role.name}</span>
            </label>
          ))}

          {roles.length === 0 && (
            <p className="text-slate-500 text-xs">No roles available.</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={close}
            className="px-3 py-2 bg-slate-800 rounded-md text-sm"
            disabled={saving}
          >
            Cancel
          </button>

          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-md text-sm text-white"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
