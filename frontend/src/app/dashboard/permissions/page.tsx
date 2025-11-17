"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import PermissionsTable from "./PermissionsTable";
import CreatePermissionModal from "./CreatePermissionModal";
import { KeyRound, PlusCircle } from "lucide-react";

export type Permission = {
  id: string;
  name: string;
  description: string | null;
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<Permission[]>("/permissions");
      setPermissions(res.data);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to load permissions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Permissions</h1>
            <p className="text-xs text-slate-400">
              Manage the fine-grained actions that roles can perform.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500 hover:bg-purple-600 text-sm font-medium text-white shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          New Permission
        </button>
      </div>

      {/* Status */}
      {loading && (
        <p className="text-sm text-slate-400">Loading permissions…</p>
      )}
      {error && (
        <p className="text-sm text-red-400">Error: {error}</p>
      )}

      {/* Table */}
      {!loading && !error && (
        <PermissionsTable
          permissions={permissions}
          reload={loadPermissions}
        />
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreatePermissionModal
          close={() => setShowCreate(false)}
          reload={loadPermissions}
        />
      )}
    </div>
  );
}