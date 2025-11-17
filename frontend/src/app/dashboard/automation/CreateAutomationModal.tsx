"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Zap } from "lucide-react";
import { toastSuccess } from "@/lib/toast";
import Spinner from "@/components/Spinner";

type Props = {
  close: () => void;
  reload: () => void | Promise<void>;
};

export default function CreateAutomationModal({ close, reload }: Props) {
  const [name, setName] = useState("");
  const [event, setEvent] = useState("");
  const [url, setUrl] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim() || !event.trim() || !url.trim()) {
      setError("All fields are required.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/automation/rules", {
        name,
        event,
        targetUrl: url,
        enabled,
      });
toastSuccess("Automation rule created");

      await reload();
      close();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-700 p-5">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Create Automation Rule
        </h2>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs mb-1">Name</label>
            <input
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: notify-admin"
            />
          </div>

          <div>
            <label className="block text-xs mb-1">Event</label>
            <input
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="abac.denied"
            />
          </div>

          <div>
            <label className="block text-xs mb-1">Target URL</label>
            <input
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/webhook"
            />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <span className="text-xs">Enabled</span>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
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
