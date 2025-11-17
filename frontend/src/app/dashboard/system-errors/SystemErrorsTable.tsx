"use client";

import { SystemError } from "./types";

type Props = {
  errors: SystemError[];
  reload: () => void;
};

export default function SystemErrorsTable({ errors }: Props) {
  return (
    <div className="border border-slate-800 rounded-lg overflow-auto max-h-[650px]">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-900 sticky top-0">
          <tr>
            <th className="px-3 py-2 text-left">Message</th>
            <th className="px-3 py-2 text-left">Code</th>
            <th className="px-3 py-2 text-left">Path</th>
            <th className="px-3 py-2 text-left">User</th>
            <th className="px-3 py-2 text-left">Created</th>
          </tr>
        </thead>

        <tbody>
          {errors.map((e) => (
            <tr key={e.id} className="border-b border-slate-800">
              <td className="px-3 py-2 max-w-[300px] ">{e.message}</td>
              <td className="px-3 py-2">{e.code || "-"}</td>
              <td className="px-3 py-2">{e.path || "-"}</td>
              <td className="px-3 py-2">{e.userEmail || "-"}</td>
              <td className="px-3 py-2 text-xs">
                {new Date(e.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}

          {errors.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="text-center text-slate-500 py-3 text-sm"
              >
                No system errors found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
