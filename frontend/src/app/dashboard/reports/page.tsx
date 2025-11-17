"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import api from "@/lib/api";
import { saveAs } from "file-saver";
import { toastInfo } from "@/lib/toast";

const reports = [
  {
    name: "Users Report",
    file: "users-report.csv",
    endpoint: "/reports/users.csv",
    color: "text-emerald-400",
  },
  {
    name: "Audit Logs",
    file: "audit-report.csv",
    endpoint: "/reports/audit.csv",
    color: "text-blue-400",
  },
  {
    name: "Security Events",
    file: "security-report.csv",
    endpoint: "/reports/security.csv",
    color: "text-red-400",
  },
  {
    name: "CSV Import Report",
    file: "csv-import-report.csv",
    endpoint: "/reports/import.csv",
    color: "text-yellow-400",
  },
  {
    name: "All Metrics",
    file: "all-metrics.csv",
    endpoint: "/reports/metrics.csv",
    color: "text-purple-400",
  },
];

export default function ReportsPage() {
  const download = async (endpoint: string, filename: string) => {
    try {
      const res = await api.get(endpoint, {
        responseType: "blob",
      });

      saveAs(res.data, filename);
      toastInfo("Report generated");

    } catch (err) {
      console.error(err);
      alert("Failed to download report");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
        Reports & Exports
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <div
            key={r.file}
            className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between"
          >
            <div>
              <h2 className={`text-lg font-semibold mb-1 ${r.color}`}>
                {r.name}
              </h2>
              <p className="text-sm text-slate-400">
                Download the latest {r.name.toLowerCase()} as CSV.
              </p>
            </div>

            <button
              onClick={() => download(r.endpoint, r.file)}
              className="flex items-center gap-2 mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-md"
            >
              <Download className="w-4 h-4" /> Download CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
