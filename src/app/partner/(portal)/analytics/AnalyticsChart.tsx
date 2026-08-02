"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type MonthPoint = {
  month: string;
  sold: number;
  spend: number;
  estimatedProfit: number;
};

const tooltipStyle = {
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  color: "#fff",
};

export default function AnalyticsChart({
  data,
  mode,
}: {
  data: MonthPoint[];
  mode: "purchases" | "profit" | "volume";
}) {
  const barKey = mode === "purchases" ? "spend" : "estimatedProfit";
  return (
    <ResponsiveContainer width="100%" height="100%">
      {mode === "volume" ? (
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="sold" stroke="#34d399" strokeWidth={2} />
        </LineChart>
      ) : (
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey={barKey} fill="#34d399" radius={[6, 6, 0, 0]} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
