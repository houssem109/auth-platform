"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AbacTable from "./AbacTable";
import CreateAbacModal from "./CreateAbacModal";
import { ShieldCheck, PlusCircle } from "lucide-react";

export type AbacRule = {
  id: string;
  name: string;
  description: string | null;
  permissionName: string;
  attribute: string;
  operator: string;
  value: string;
  effect: string;
};

export default function AbacPage() {
  const [rules, setRules] = useState<AbacRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadRules = async () => {
    try {
      setLoading(true);
      const res = await api.get("/abac-rules");
      setRules(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">ABAC Rules</h1>
            <p className="text-xs text-slate-400">
              Manage attribute-based access policies.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-sm text-white"
        >
          <PlusCircle className="h-4 w-4" />
          New Rule
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <p className="text-slate-400 text-sm">Loading rules…</p>
      ) : (
        <AbacTable rules={rules} reload={loadRules} />
      )}

      {showCreate && (
        <CreateAbacModal close={() => setShowCreate(false)} reload={loadRules} />
      )}
    </div>
  );
}
