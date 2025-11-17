"use client";

import { Users, ShieldCheck, Key, FileText } from "lucide-react";

type Props = {
  data: {
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
};

export default function OverviewCards({ data }: Props) {
 const items = [
  { label: "Active Users", value: data.activeUsers, icon: <Users className="w-5 h-5" /> },
  { label: "Total Users", value: data.totalUsers, icon: <ShieldCheck className="w-5 h-5" /> },
  { label: "Audit Logs", value: data.auditLogs, icon: <FileText className="w-5 h-5" /> },
  { label: "Total Succes", value: data.recentEvents.filter(e => e.type === "csv_import_success").length, icon: <ShieldCheck className="w-5 h-5" /> },
];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="p-4 bg-slate-900 border border-slate-800 rounded-xl"
        >
          <div className="flex items-center gap-2 text-slate-300">
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </div>
          <p className="text-2xl font-semibold mt-2">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
