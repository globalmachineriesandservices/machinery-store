"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface InquiryByStatus { status: string; count: number }
interface ProductsByCategory { category: string; count: number }
interface InquiryTrend { month: string; inquiries: number; messages: number }

interface Props {
  inquiriesByStatus: InquiryByStatus[];
  productsByCategory: ProductsByCategory[];
  inquiryTrend: InquiryTrend[];
  topProducts: { name: string; inquiries: number; reviews: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f97316",
  REPLIED: "#22c55e",
  CLOSED: "#94a3b8",
};

const CATEGORY_COLORS = [
  "#1e3a5f", "#f97316", "#22c55e", "#3b82f6",
  "#a855f7", "#ec4899", "#14b8a6", "#eab308",
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-xl shadow-lg px-4 py-3 text-sm">
      {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-bold text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function DashboardCharts({ inquiriesByStatus, productsByCategory, inquiryTrend, topProducts }: Props) {
  return (
    <div className="space-y-6">
      {/* Row 1: Area chart + Pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiry trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Inquiry & Message Trend</CardTitle>
            <CardDescription>Monthly volume over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={inquiryTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="inquiryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="messageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="inquiries" stroke="#1e3a5f" strokeWidth={2} fill="url(#inquiryGrad)" dot={{ r: 3, fill: "#1e3a5f" }} />
                <Area type="monotone" dataKey="messages" stroke="#f97316" strokeWidth={2} fill="url(#messageGrad)" dot={{ r: 3, fill: "#f97316" }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inquiries by status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inquiries by Status</CardTitle>
            <CardDescription>Current breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={inquiriesByStatus}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="status"
                >
                  {inquiriesByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, String(name)]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(value) => <span className="capitalize text-muted-foreground">{String(value).toLowerCase()}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Products per category + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products by category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Products by Category</CardTitle>
            <CardDescription>Distribution across all categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={productsByCategory} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="category"
                  type="category"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 14) + "…" : v}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {productsByCategory.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top products by inquiry */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Products</CardTitle>
            <CardDescription>By inquiries and reviews received</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topProducts} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + "…" : v}
                />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="inquiries" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reviews" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
