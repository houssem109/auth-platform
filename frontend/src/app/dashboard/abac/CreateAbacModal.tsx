"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { ShieldPlus } from "lucide-react";
import { toastSuccess } from "@/lib/toast";

type Props = {
  close: () => void;
  reload: () => void;
};

export default function CreateAbacModal({ close, reload }: Props) {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [permissionName, setPermissionName] = useState("");
  const [attribute, setAttribute] = useState("department");
  const [operator, setOperator] = useState("equals");
  const [value, setValue] = useState("");
  const [effect, setEffect] = useState("deny");

  useEffect(() => {
    api.get("/permissions").then((res) => setPermissions(res.data));
  }, []);

  const save = async () => {
    await api.post("/abac-rules", {
      name,
      description: "",
      permissionName,
      attribute,
      operator,
      value,
      effect,
    });
    toastSuccess("ABAC rule created");

    reload();
    close();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={close}
    >
      <div
        className="w-full max-w-lg bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
          <ShieldPlus className="w-5 h-5 text-blue-400" />
          New ABAC Rule
        </h2>

        <div className="space-y-4">
          {/* NAME */}
          <div>
            <label className="text-sm font-medium text-slate-300">
              Rule Name
            </label>
            <input
              className="mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
              placeholder="Rule name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* PERMISSION */}
          <div>
            <label className="text-sm font-medium text-slate-300">
              Permission
            </label>
            <select
              className="mt-1 w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
              value={permissionName}
              onChange={(e) => setPermissionName(e.target.value)}
            >
              <option value="">Select permission</option>
              {permissions.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* ATTRIBUTE */}
          <div>
            <label className="text-sm font-medium text-slate-300">
              Attribute
            </label>
            <select
              className="mt-1 w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
              value={attribute}
              onChange={(e) => setAttribute(e.target.value)}
            >
              <option value="department">department</option>
              <option value="location">location</option>
              <option value="time">time</option>
            </select>
          </div>

          {/* OPERATOR */}
          <div>
            <label className="text-sm font-medium text-slate-300">
              Operator
            </label>
            <select
              className="mt-1 w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
            >
              <option value="equals">equals</option>
              <option value="in">in</option>
              <option value="between">between</option>
            </select>
          </div>

          {/* VALUE */}
          <div>
            <label className="text-sm font-medium text-slate-300">
              Value (JSON)
            </label>
            <input
              className="mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
              placeholder='e.g. "HR", ["Tunis"], {"start":"08:00","end":"18:00"}'
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          {/* EFFECT */}
          <div>
            <label className="text-sm font-medium text-slate-300">Effect</label>
            <select
              className="mt-1 w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
              value={effect}
              onChange={(e) => setEffect(e.target.value)}
            >
              <option value="deny">deny</option>
              <option value="allow">allow</option>
            </select>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition"
            onClick={close}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
            onClick={save}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
