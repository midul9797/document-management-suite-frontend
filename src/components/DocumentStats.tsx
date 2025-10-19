"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { name: "Jan", documents: 45, views: 120 },
  { name: "Feb", documents: 52, views: 145 },
  { name: "Mar", documents: 48, views: 138 },
  { name: "Apr", documents: 61, views: 167 },
  { name: "May", documents: 55, views: 152 },
  { name: "Jun", documents: 67, views: 189 },
  { name: "Jul", documents: 58, views: 174 },
  { name: "Aug", documents: 72, views: 203 },
  { name: "Sep", documents: 65, views: 186 },
  { name: "Oct", documents: 78, views: 221 },
  { name: "Nov", documents: 71, views: 198 },
  { name: "Dec", documents: 85, views: 245 },
];

export function DocumentStats() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="documents"
          stackId="1"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="views"
          stackId="2"
          stroke="#82ca9d"
          fill="#82ca9d"
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
