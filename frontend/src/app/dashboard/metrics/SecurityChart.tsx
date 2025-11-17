"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

type Props = {
  data: {
    rbacDenies: number;
    abacDenies: number;
  };
};

const COLORS = ["#ef4444", "#3b82f6"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0];

  return (
    <div
      className="p-2 rounded-md"
      style={{
        background: "#0f172a",   // popup background
        color: "#38bdf8",        // text color
        border: "1px solid #38bdf8",
      }}
    >
      <p className="text-sm font-semibold">{item.name}</p>
      <p className="text-sm">Count: {item.value}</p>
    </div>
  );
};

export default function SecurityChart({ data }: Props) {
  const chartData = [
    { type: "RBAC Denies", count: data.rbacDenies },
    { type: "ABAC Denies", count: data.abacDenies },
  ];

  return (
    <PieChart width={350} height={240}>
      <Pie
        data={chartData}
        dataKey="count"
        nameKey="type"
        cx="50%"
        cy="50%"
        outerRadius={80}
        label
      >
        {chartData.map((_, i) => (
          <Cell key={i} fill={COLORS[i % COLORS.length]} />
        ))}
      </Pie>

      {/* Custom Tooltip */}
      <Tooltip content={<CustomTooltip />} />
    </PieChart>
  );
}
