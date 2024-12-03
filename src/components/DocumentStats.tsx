"use client";

import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts";

const data = [
  { name: "PDF", value: 120 },
  { name: "DOCX", value: 80 },
  { name: "XLSX", value: 40 },
  { name: "Others", value: 18 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function DocumentStats() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
