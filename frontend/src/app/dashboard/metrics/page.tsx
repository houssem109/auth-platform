"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import OverviewCards from "./OverviewCards";
import SecurityChart from "./SecurityChart";
import UsageChart from "./UsageChart";
import { ShieldAlert, Activity, BarChart3 } from "lucide-react";

type OverviewMetrics = {
  activeUsers: number;
  totalUsers: number;
  auditLogs: number;
  recentEvents: {
    id: string;
    type: string;
    metadata: string;
    createdAt: string;
  }[];
};

type SecurityMetric = {
  rbacDenies: number;
  abacDenies: number;
};

type UsagePoint = {
  date: string;
  count: number;
};

export default function MetricsPage() {
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [security, setSecurity] = useState<SecurityMetric | null>(null);
  const [usage, setUsage] = useState<UsagePoint[]>([]);

  const load = async () => {
    const o = await api.get("/metrics/overview");
    const s = await api.get("/metrics/security");
    const u = await api.get("/metrics/usage");

    setOverview(o.data);
    setSecurity(s.data);
    setUsage(
      u.data.map((p: any) => ({
        date: new Date(p.date).toLocaleDateString("en-GB"),
        count: p.count,
      }))
    );
  };

  useEffect(() => {
    load();
  }, []);

  if (!overview || !security) {
    return <p className="p-6 text-slate-400">Loading metrics...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-6 h-6 text-emerald-400" />
        <h1 className="text-xl font-semibold">Metrics Dashboard</h1>
      </div>

      <OverviewCards data={overview} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h2 className="font-semibold">Security Breakdown</h2>
          </div>

          <SecurityChart data={security} />
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <h2 className="font-semibold">Usage Timeline</h2>
          </div>

          <UsageChart data={usage} />
        </div>
      </div>
    </div>
  );
}
