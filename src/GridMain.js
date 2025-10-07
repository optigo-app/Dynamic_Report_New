import React, { useState, useEffect } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import { Box, Paper, Typography } from "@mui/material";
import { AlertTriangle } from "lucide-react";
import ReportHome from "./Components/Pages/Report/ReportHome";

const GridMain = ({
  tokenMissing,
  ready,
  reportId,
  spNumber,
  largeData,
  largeDataTitle,
}) => {
  if (tokenMissing) {
    return (
      <Box display="flex" justifyContent="center" minHeight="70vh" p={2}>
        <Paper
          elevation={3}
          sx={{
            maxWidth: 500,
            width: "100%",
            p: 4,
            borderRadius: "20px",
            textAlign: "center",
          }}
        >
          <Box display="flex" justifyContent="center" mb={2}>
            <AlertTriangle size={48} color="#f44336" />
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            You've been logged out
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your session has ended. Please log in again to continue.
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!ready) return null;
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ReportHome
            reportId={reportId}
            spNumber={spNumber}
            largeData={largeData}
            largeDataTitle={largeDataTitle}
          />
        }
      />
    </Routes>
  );
};

export default GridMain;