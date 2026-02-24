import React, { useMemo } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#6366F1", "#10B981", "#F43F5E", "#F59E0B", "#3B82F6",
  "#8B5CF6", "#06B6D4", "#84CC16", "#EC4899", "#A855F7",
];

const PieChartView = ({ filteredRows, selectedMonth = null }) => {

  // 🔹 Transform data → CallType count (month-wise)
  const pieData = useMemo(() => {
    const map = {};

    filteredRows?.forEach(row => {
      const date = new Date(row.date);
      const month = date.getMonth();

      // month filter
      if (selectedMonth !== null && month !== selectedMonth) return;

      const callType = row.CallType || "Unknown";
      map[callType] = (map[callType] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value
    }));
  }, [filteredRows, selectedMonth]);

  return (
    <Box>
      <Typography variant="h6" fontWeight={500} mb={2}>
        Month Wise Call Type Count
      </Typography>

      <Box display="flex" alignItems="center" gap={4}>
        {/* Pie */}
        <ResponsiveContainer width="60%" height={260}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              stroke="none"
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => [`${value}`, "Calls"]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <Stack spacing={0.6} maxHeight={260} overflow="auto" pr={1}>
          {pieData.map((item, i) => (
            <Box key={i} display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: 0.5,
                  backgroundColor: COLORS[i % COLORS.length],
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontSize: 13,
                  color: "#334155",
                  whiteSpace: "nowrap",
                }}
              >
                {item.name} — {item.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default PieChartView;
