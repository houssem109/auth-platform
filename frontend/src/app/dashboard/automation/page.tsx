"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

import { Workflow } from "lucide-react";
import AutomationTable from "./AutomationTable";
import CreateAutomationModal from "./CreateAutomationModal";

export type AutomationRule = {
  id: string;
  name: string;
  event: string;
  targetUrl: string;
  enabled: boolean;
  createdAt: string;
};

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    const res = await api.get("/automation/rules");
    setRules(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Workflow className="w-6 h-6 text-purple-400" />
          Automation Rules
        </h1>

        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-sm"
        >
          + New Rule
        </button>
      </div>

      <AutomationTable rules={rules} reload={load} />

      {showCreate && (
        <CreateAutomationModal close={() => setShowCreate(false)} reload={load} />
      )}
    </div>
  );
}
