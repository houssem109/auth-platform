"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Shield } from "lucide-react";
import { AbacRule } from "./page";
import { toastSuccess } from "@/lib/toast";

type Props = {
  close: () => void;
  reload: () => void;
  rule: AbacRule;
};

export default function EditAbacModal({ rule, close, reload }: Props) {
  const [name, setName] = useState(rule.name);
  const [permissionName, setPermissionName] = useState(rule.permissionName);
  const [attribute, setAttribute] = useState(rule.attribute);
  const [operator, setOperator] = useState(rule.operator);
  const [value, setValue] = useState(rule.value);
  const [effect, setEffect] = useState(rule.effect);

  const save = async () => {
    await api.put(`/abac-rules/${rule.id}`, {
      name,
      permissionName,
      attribute,
      operator,
      value,
      effect,
    });
    toastSuccess("ABAC rule updated");

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
          <Shield className="w-5 h-5 text-blue-400" />
          Edit ABAC Rule
        </h2>

        <div className="space-y-4">

          {/* NAME */}
          <div>
            <label className="text-sm font-medium text-slate-300">Rule Name</label>
            <input
              className="input mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* PERMISSION */}
          <div>
            <label className="text-sm font-medium text-slate-300">Permission</label>
            <input
              className="input mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
              value={permissionName}
              onChange={(e) => setPermissionName(e.target.value)}
            />
          </div>

          {/* ATTRIBUTE */}
          <div>
            <label className="text-sm font-medium text-slate-300">Attribute</label>
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
            <label className="text-sm font-medium text-slate-300">Operator</label>
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
            <label className="text-sm font-medium text-slate-300">Value</label>
            <input
              className="input mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
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

        {/* ACTION BUTTONS */}
        <div className="flex justify-end mt-6 gap-2">
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
