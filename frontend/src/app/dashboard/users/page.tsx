"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toastError } from "@/lib/toast";
import AssignRolesModal from "./AssignRolesModal";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";
export type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  department: string | null;
  location: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [assignUser, setAssignUser] = useState<User | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load users");
      toastError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Users</h1>

        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-2 rounded-md text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          + Create User
        </button>
      </div>

      {loading && <p className="text-sm text-slate-400">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <div
          className="
            max-h-[600px]
            overflow-auto
            border border-slate-800 rounded-lg
            scrollbar-thin scrollbar-thumb-slate-700
          "
        >
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Department</th>
                <th className="px-3 py-2 text-left">Location</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-800 hover:bg-slate-900"
                >
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">
                    {(u.firstName || "") + " " + (u.lastName || "")}
                  </td>
                  <td className="px-3 py-2">{u.department || "-"}</td>
                  <td className="px-3 py-2">{u.location || "-"}</td>

                  <td className="px-3 py-2 space-x-2">
                    <button
                      onClick={() => setEditUser(u)}
                      className="px-3 py-1 text-xs rounded-md bg-slate-700 hover:bg-slate-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setAssignUser(u)}
                      className="px-3 py-1 text-xs rounded-md bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      Roles
                    </button>

                    <button
                      onClick={async () => {
                        if (!confirm(`Delete user ${u.email}?`)) return;
                        try {
                          await api.delete(`/users/${u.id}`);
                          load();
                        } catch {
                          toastError("Failed to delete user");
                        }
                      }}
                      className="px-3 py-1 text-xs rounded-md bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 text-center text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create */}
      {showCreate && (
        <CreateUserModal close={() => setShowCreate(false)} reload={load} />
      )}

      {/* Edit */}
      {editUser && (
        <EditUserModal user={editUser} close={() => setEditUser(null)} reload={load} />
      )}

      {/* Assign Roles */}
      {assignUser && (
        <AssignRolesModal
          user={assignUser}
          close={() => setAssignUser(null)}
          reload={load}
        />
      )}
    </div>
  );
}
