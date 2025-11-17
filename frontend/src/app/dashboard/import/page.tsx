"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Upload, FileText } from "lucide-react";
import { toastSuccess } from "@/lib/toast";
import Spinner from "@/components/Spinner";

export default function ImportPage() {
  const [csv, setCsv] = useState(
    "email,password,firstName,lastName,department,location\n"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported: number;
    errors: string[];
  } | null>(null);

  const handleImport = async () => {
    if (!csv.trim()) {
      alert("Please paste CSV content first");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post("/users/import", csv, {
        headers: {
          "Content-Type": "text/csv",
        },
      });

      setResult(res.data);
      toastSuccess(`Imported ${res.data.imported} users successfully`);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold flex items-center gap-2">
        <Upload className="w-5 h-5 text-blue-400" />
        CSV Bulk Import
      </h1>

      <p className="text-sm text-slate-400">
        Paste CSV content using the required structure:
      </p>

      <pre className="text-xs p-3 rounded-md bg-slate-900 border border-slate-700 text-slate-300">
        email,password,firstName,lastName,department,location example :
        john@example.com,pass123,John,Doe,HR,Tunis
        sara@example.com,pass123,Sara,Smith,Finance,Sousse
      </pre>

      {/* Textarea */}
      <textarea
        placeholder="Paste CSV content here..."
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        className="w-full h-64 bg-slate-900 text-slate-200 border border-slate-700 p-3 rounded-lg outline-none"
      ></textarea>
      {/* Import button */}
      <button
        onClick={handleImport}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-60"
      >
        <FileText className="w-4 h-4" />
        {loading ?  <Spinner /> : "Import CSV"}
      </button>

      
    </div>
  );
}
