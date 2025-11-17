"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import RolesTable from "./RolesTable";
import CreateRoleModal from "./CreateRoleModal";

export type Role = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  rolePermissions?: {
    permissionId: string;
    permission: {
      id: string;
      name: string;
      description: string | null;
    };
  }[];
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<Role[]>("/roles");
      setRoles(res.data);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to load roles"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Roles</h1>
          <p className="text-sm text-slate-400">
            Manage RBAC roles and their permissions.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-medium text-white"
        >
          + Create Role
        </button>
      </div>

      {loading && (
        <p className="text-sm text-slate-400">Loading roles...</p>
      )}

      {error && (
        <p className="text-sm text-red-400 mb-3">
          Error: {error}
        </p>
      )}

      {!loading && !error && (
        <RolesTable roles={roles} reload={loadRoles} />
      )}

      {showCreateModal && (
        <CreateRoleModal
          close={() => setShowCreateModal(false)}
          reload={loadRoles}
        />
      )}
    </div>
  );
}
