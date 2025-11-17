"use client";

import { useState } from "react";
import api from "@/lib/api";
import { toastSuccess, toastError } from "@/lib/toast";
import Spinner from "@/components/Spinner";

type Props = {
  close: () => void;
  reload: () => void | Promise<void>;
};

export default function CreateUserModal({ close, reload }: Props) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    department: "",
    location: "",
  });

  const [saving, setSaving] = useState(false);

  const update = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const save = async () => {
    if (!form.email || !form.password) {
      toastError("Email and password are required");
      return;
    }

    try {
      setSaving(true);
      await api.post("/users", form);
      toastSuccess("User created");
      await reload();
      close();
    } catch (err) {
      console.error(err);
      toastError("Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-4">Create User</h2>

        <div className="space-y-3">
          <input
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2 bg-slate-800 rounded-md text-sm"
          />

          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 bg-slate-800 rounded-md text-sm"
          />

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
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-sm text-white"
          >
            {saving ?  <Spinner /> : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
