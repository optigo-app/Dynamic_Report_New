import React from "react";
import { Box, Typography, useTheme, Stack } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const vendorColors = [
    "#6366F1", "#10B981", "#F43F5E", "#F59E0B", "#3B82F6",
    "#8B5CF6", "#06B6D4", "#84CC16", "#EC4899", "#A855F7",
];

const PieChartView = () => {
    const TopVendorData = [
        { name: "Vendor A", sales: 400 },
        { name: "Vendor B", sales: 300 },
        { name: "Vendor C", sales: 200 },
        { name: "Vendor D", sales: 100 },
        { name: "Vendor E", sales: 50 },
        { name: "Vendor F", sales: 25 },
        { name: "Vendor G", sales: 15 },
        { name: "Vendor H", sales: 10 },
        { name: "Vendor I", sales: 5 },
        { name: "Vendor J", sales: 2 },
        { name: "Vendor k", sales: 2 },
        { name: "Vendor l", sales: 20 },
        { name: "Vendor m", sales: 30 },
        { name: "Vendor n", sales: 40 },
        { name: "Vendor o", sales: 50 },
        { name: "Vendor p", sales: 60 },
    ];

    return (
        <Box sx={{ width: '700px', }}>
            <Typography variant="h6" fontWeight={500} color="text.primary" mb={2}>
                Sales by Vendor
            </Typography>

            <Box display="flex" alignItems="center" gap={4}>
                {/* Pie Chart */}
                <ResponsiveContainer width="60%" height={260}>
                    <PieChart>
                        <Pie
                            data={TopVendorData}
                            dataKey="sales"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={0}
                            outerRadius={120}
                            paddingAngle={0}
                            stroke="none"
                            isAnimationActive={false}
                        >
                            {TopVendorData?.map((_, i) => (
                                <Cell key={i} fill={vendorColors[i % vendorColors.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: 8,
                                fontSize: 13,
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                <Stack spacing={0.5} maxHeight={260} overflow="auto" pr={1}>
                    {TopVendorData?.map((vendor, i) => (
                        <Box key={i} display="flex" alignItems="center" gap={1}>
                            <Box
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 0.5,
                                    backgroundColor: vendorColors[i % vendorColors.length],
                                    flexShrink: 0,
                                }}
                            />
                            <Typography variant="body2" sx={{ color: "#334155", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>

                                {vendor.name} — {vendor.sales}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
};

export default PieChartView;
