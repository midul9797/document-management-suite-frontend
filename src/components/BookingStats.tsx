"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  {
    name: "Jan",
    active: 100,
    completed: 80,
  },
  {
    name: "Feb",
    active: 120,
    completed: 100,
  },
  {
    name: "Mar",
    active: 150,
    completed: 130,
  },
  {
    name: "Apr",
    active: 180,
    completed: 160,
  },
  {
    name: "May",
    active: 220,
    completed: 200,
  },
  {
    name: "Jun",
    active: 250,
    completed: 230,
  },
];

export function BookingStats() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
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
        <Line
          type="monotone"
          dataKey="active"
          stroke="#8884d8"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#82ca9d"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
