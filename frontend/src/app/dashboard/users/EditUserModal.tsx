"use client";

import { useState } from "react";
import api from "@/lib/api";
import { toastSuccess, toastError } from "@/lib/toast";
import type { User } from "./page";
import Spinner from "@/components/Spinner";

type Props = {
  user: User;
  close: () => void;
  reload: () => void | Promise<void>;
};

export default function EditUserModal({ user, close, reload }: Props) {
  const [form, setForm] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    department: user.department || "",
    location: user.location || "",
  });

  const [saving, setSaving] = useState(false);

  const update = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const save = async () => {
    try {
      setSaving(true);
      await api.put(`/users/${user.id}`, form);
      toastSuccess("User updated");
      await reload();
      close();
    } catch (err) {
      console.error(err);
      toastError("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-4">
          Edit User — {user.email}
        </h2>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              placeholder="First name"
              className="flex-1 px-3 py-2 bg-slate-800 rounded-md text-sm"
            />
            <input
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              placeholder="Last name"
              className="flex-1 px-3 py-2 bg-slate-800 rounded-md text-sm"
            />
          </div>

          <input
            value={form.department}
            onChange={(e) => update("department", e.target.value)}
            placeholder="Department"
            className="w-full px-3 py-2 bg-slate-800 rounded-md text-sm"
          />

          <input
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Location"
            className="w-full px-3 py-2 bg-slate-800 rounded-md text-sm"
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
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
            {saving ?  <Spinner /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
