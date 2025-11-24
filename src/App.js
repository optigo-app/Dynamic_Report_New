import { RecoilRoot } from "recoil";
import "./App.css";
import {
  BrowserRouter,
  Route,
  Routes,
  useSearchParams,
} from "react-router-dom";
import { DeviceStatusProvider } from "./DeviceStatusContext";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  CircularProgress,
  CssBaseline,
  IconButton,
  ThemeProvider,
} from "@mui/material";
import ReportListPage from "./Components/Pages/ReportListPage/ReportListPage";
import { CallApi } from "./API/CallApi/CallApi";
import { readAndDecodeCookie } from "./Utils/globalFunc";
import testingData from "../src/Components/Pages/Report/SampleData_getPageIdAPI.json";
import { darkTheme, lightTheme } from "./Components/Theme/theme";
import { DarkMode, LightMode } from "@mui/icons-material";

const GridMain = lazy(() => import("./GridMain"));
function RouterContent() {
  const [searchParams] = useSearchParams();
  const pid = searchParams.get("pid");
  const CN = searchParams.get("CN");

  const [tokenMissing, setTokenMissing] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [spNumber, setSpNumber] = useState(null);
  const [largeData, setLargeData] = useState(false);
  const [dateOptionsShow, setLargeDataShow] = useState(false);
  const [spliterReportShow, setSpliterReportShow] = useState(false);
  const [spliterReportFirstPanel, setSpliterReportFirstPanel] = useState();
  const [spliterReportSecondPanel, setSpliterReportSecondPanel] = useState();
  const [spliterReportMonthRestiction, setSpliterReportMonthRestiction] =
    useState();
  const [otherSpliterSideData, setOtherSpliterSideData] = useState();
  const [dateOptions, setDateOptions] = useState();
  const [largeDataTitle, setLargeDataTitle] = useState("");
  const [reportName, setReportName] = useState("");
  const [colorMaster, setColorMaster] = useState();
  const [ready, setReady] = useState(false);

  const decodeBase64 = (str) => {
    if (!str) return null;
    try {
      return atob(str);
    } catch (e) {
      console.error("Error decoding base64:", e);
      return null;
    }
  };

  useEffect(() => {
    const initializeAndFetchReport = async () => {
      if (!CN) {
        setTokenMissing(true);
        return;
      }
      try {
        const decodedCN = decodeBase64(CN);
        const cookieData = await readAndDecodeCookie(decodedCN);
        if (!cookieData) {
          setTokenMissing(true);
          return;
        }
        sessionStorage.setItem("reportVarible", JSON.stringify(cookieData));
        let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
        const body = {
          con: JSON.stringify({
            id: "",
            mode: "getPageId",
            appuserid: AllData?.LUId,
          }),
          p: JSON.stringify({ PageId: pid }),
          f: "DynamicReport (get column data)",
        };

        const response = await CallApi(body);
        // const response = testingData;
        if (response?.Status === "400") {
          setTokenMissing(true);
          return;
        }
        const data = response?.rd?.[0];
        setColorMaster(response?.rd2);
        if (data?.stat === 1) {
          setReportId(data.ReportId);
          setSpNumber(data.SpNumber);
          setLargeDataTitle(data.MasterDataList || "");
          setLargeData(!!data.IsLargeDataReport);
          setSpliterReportShow(data.IsSpliterReport);
          setLargeDataShow(data.ServerSideDateWiseFilter);
          setSpliterReportFirstPanel(data.SpliterFirstPanel);
          setSpliterReportSecondPanel(data.SpliterSecondPanel);
          setSpliterReportMonthRestiction(data.DateMonthRestriction);
          setReportName(data.ReportName);
          setOtherSpliterSideData(data.otherSpliterSideData);
          setDateOptions(response?.rd1);
          const key = `${pid}_${data.ReportId}`;
          sessionStorage.setItem(key, data.ReportId);
        }
        setReady(true);
      } catch (err) {
        console.error(err);
        setTokenMissing(true);
      }
    };

    initializeAndFetchReport();
  }, [pid, CN]);

  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </div>
      }
    >
      <Routes>
        {pid === "18340" ? (
          <Route path="/" element={<ReportListPage />} />
        ) : (
          <Route
            path="/*"
            element={
              <GridMain
                tokenMissing={tokenMissing}
                ready={ready}
                reportId={reportId}
                spNumber={spNumber}
                largeData={largeData}
                largeDataTitle={largeDataTitle}
                dateOptions={dateOptions}
                dateOptionsShow={dateOptionsShow}
                reportName={reportName}
                spliterReportShow={spliterReportShow}
                spliterReportFirstPanel={spliterReportFirstPanel}
                spliterReportSecondPanel={spliterReportSecondPanel}
                spliterReportMonthRestiction={spliterReportMonthRestiction}
                otherSpliterSideData={otherSpliterSideData}
                colorMaster={colorMaster}
              />
            }
          />
        )}
      </Routes>
    </Suspense>
  );
}

export default function App() {
  const [mode, setMode] = useState("light");

  const theme = useMemo(
    () => (mode === "light" ? lightTheme : darkTheme),
    [mode]
  );

  function getBaseName() {
    const path = window.location.pathname;
    const match = path.match(/^\/([^/]+\/[^/]+)/);
    return match ? `/${match[1]}` : "/";
  }

  return (
    <RecoilRoot>
      {/* <ThemeProvider theme={theme}>
        <CssBaseline />
        <IconButton
          onClick={() =>
            setMode((prev) => (prev === "light" ? "dark" : "light"))
          }
        >
          {mode === "light" ? <DarkMode /> : <LightMode />}
        </IconButton> */}
        <DeviceStatusProvider>
          <BrowserRouter basename={getBaseName()}>
            <RouterContent />
          </BrowserRouter>
        </DeviceStatusProvider>
      {/* </ThemeProvider> */}
    </RecoilRoot>
  );
}
