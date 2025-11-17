"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Props = {
  data: { date: string; count: number }[];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="p-2 rounded-md"
      style={{
        background: "#0f172a",    // 🔵 background color
        color: "#38bdf8",         // 🔵 text color
        border: "1px solid #38bdf8",
      }}
    >
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-sm">Count: {payload[0].value}</p>
    </div>
  );
};

export default function UsageChart({ data }: Props) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          
          {/* Custom Tooltip */}
          <Tooltip content={<CustomTooltip />} />

          <Line
            type="monotone"
            dataKey="count"
            stroke="#38bdf8"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
