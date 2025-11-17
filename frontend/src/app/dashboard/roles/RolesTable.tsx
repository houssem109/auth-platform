"use client";

import { useState } from "react";
import api from "@/lib/api";
import type { Role } from "./page";
import EditRoleModal from "./EditRoleModal";
import AssignPermissionsModal from "./AssignPermissionsModal";
import { toastSuccess } from "@/lib/toast";

type Props = {
  roles: Role[];
  reload: () => Promise<void> | void;
};

export default function RolesTable({ roles, reload }: Props) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showAssign, setShowAssign] = useState(false);

  const handleDelete = async (role: Role) => {
    if (!confirm(`Delete role "${role.name}"?`)) return;

    await api.delete(`/roles/${role.id}`);
    toastSuccess("Role deleted");
    await reload();
  };

  return (
    <>
      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900 border-b border-slate-800">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">System</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr
                key={role.id}
                className="border-b border-slate-800 hover:bg-slate-900"
              >
                <td className="px-3 py-2 font-medium">{role.name}</td>
                <td className="px-3 py-2 text-slate-300">
                  {role.description || "-"}
                </td>
                <td className="px-3 py-2">
                  {role.isSystem ? (
                    <span className="text-emerald-400 text-xs px-2 py-1 rounded-full bg-emerald-500/10">
                      system
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs px-2 py-1 rounded-full bg-slate-700/60">
                      custom
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 space-x-2">
                  <button
                    onClick={() => setSelectedRole(role)}
                    className="inline-flex items-center px-3 py-1 rounded-md text-xs bg-slate-800 hover:bg-slate-700 text-slate-100"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setShowAssign(true);
                    }}
                    className="inline-flex items-center px-3 py-1 rounded-md text-xs bg-indigo-500 hover:bg-indigo-600 text-white"
                  >
                    Permissions
                  </button>

                  {!role.isSystem && (
                    <button
                      onClick={() => handleDelete(role)}
                      className="inline-flex items-center px-3 py-1 rounded-md text-xs bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {roles.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-slate-500"
                >
                  No roles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRole && !showAssign && (
        <EditRoleModal
          role={selectedRole}
          close={() => setSelectedRole(null)}
          reload={reload}
        />
      )}

      {showAssign && selectedRole && (
        <AssignPermissionsModal
          role={selectedRole}
          close={() => {
            setShowAssign(false);
            setSelectedRole(null);
          }}
          reload={reload}
        />
      )}
    </>
  );
}
