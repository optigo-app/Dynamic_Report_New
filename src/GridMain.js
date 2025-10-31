// http://localhost:3000/?CN=UkRTRF8yMDI1MTAwNzA0MDgyNF9kZGFmNzIwOGQ4MzY0ODE0YmZiNDE3MDkyNzg0YTdiMQ==&pid=18333
// RDSD_20251007040824_ddaf7208d8364814bfb417092784a7b1
// %7b%22tkn%22%3a%22OTA2NTQ3MTcwMDUzNTY1MQ%3d%3d%22%2c%22pid%22%3a18333%2c%22IsEmpLogin%22%3a0%2c%22IsPower%22%3a0%2c%22SpNo%22%3a%22MA%3d%3d%22%2c%22SpVer%22%3a%22%22%2c%22SV%22%3a%22MA%3d%3d%22%2c%22LId%22%3a%22MTg1Mzg%3d%22%2c%22LUId%22%3a%22amVuaXNAZWcuY29t%22%2c%22DAU%22%3a%22aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvQ2VudHJhbEFwaQ%3d%3d%22%2c%22YearCode%22%3a%22e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19%22%2c%22cuVer%22%3a%22UjUwQjM%3d%22%2c%22rptapiurl%22%3a%22aHR0cDovL25ld25leHRqcy53ZWIvYXBpL3JlcG9ydA%3d%3d%22%7d

import React, { useState, useEffect } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import { Box, Paper, Typography } from "@mui/material";
import { AlertTriangle } from "lucide-react";
import ReportHome from "./Components/Pages/Report/ReportHome";
import Cookies from "js-cookie";

const GridMain = ({
  tokenMissing,
  ready,
  reportId,
  spNumber,
  largeData,
  largeDataTitle,
  dateOptions,
  dateOptionsShow,
  reportName
}) => {
  
  // useEffect(() => {
  //   Cookies.set(
  //     "RDSD_20251007040824_ddaf7208d8364814bfb417092784a7b1",
  //     "%7b%22tkn%22%3a%22OTA2NTQ3MTcwMDUzNTY1MQ%3d%3d%22%2c%22pid%22%3a18333%2c%22IsEmpLogin%22%3a0%2c%22IsPower%22%3a0%2c%22SpNo%22%3a%22MA%3d%3d%22%2c%22SpVer%22%3a%22%22%2c%22SV%22%3a%22MA%3d%3d%22%2c%22LId%22%3a%22MTg1Mzg%3d%22%2c%22LUId%22%3a%22amVuaXNAZWcuY29t%22%2c%22DAU%22%3a%22aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvQ2VudHJhbEFwaQ%3d%3d%22%2c%22YearCode%22%3a%22e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19%22%2c%22cuVer%22%3a%22UjUwQjM%3d%22%2c%22rptapiurl%22%3a%22aHR0cDovL25ld25leHRqcy53ZWIvYXBpL3JlcG9ydA%3d%3d%22%7d"
  //   );
  // }, []);

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
            dateOptions={dateOptions}
            dateOptionsShow={dateOptionsShow}
            reportName={reportName}
          />
        }
      />
    </Routes>
  );
};

export default GridMain;

// CentralApi.aspx?PRT=1
