"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { SystemError } from "./types";
import SystemErrorsTable from "./SystemErrorsTable";

export default function SystemErrorsPage() {
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get<SystemError[]>("/system-errors");
      setErrors(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load system errors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">System Errors</h1>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : (
        <SystemErrorsTable errors={errors} reload={load} />
      )}
    </div>
  );
}
