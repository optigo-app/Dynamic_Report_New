import { RecoilRoot } from "recoil";
import "./App.css";
import {
  BrowserRouter,
  Route,
  Routes,
  useSearchParams,
} from "react-router-dom";
import { DeviceStatusProvider } from "./DeviceStatusContext";
import { lazy, Suspense, useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import ReportListPage from "./Components/Pages/ReportListPage/ReportListPage";
import { CallApi } from "./API/CallApi/CallApi";
import { readAndDecodeCookie } from "./Utils/globalFunc";

const GridMain = lazy(() => import("./GridMain"));
function RouterContent() {
  const [searchParams] = useSearchParams();
  const pid = searchParams.get("pid");
  const CN = searchParams.get("CN");

  const [tokenMissing, setTokenMissing] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [spNumber, setSpNumber] = useState(null);
  const [largeData, setLargeData] = useState(false);
  const [largeDataTitle, setLargeDataTitle] = useState("");
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
        const body = {
          con: JSON.stringify({ mode: "getPageId" }),
          p: JSON.stringify({ PageId: pid }),
          f: "DynamicReport (get column data)",
        };

        const response = await CallApi(body);
        if (response?.Status === "400") {
          setTokenMissing(true);
          return;
        }

        const data = response?.rd?.[0];
        if (data?.stat === 1) {
          setReportId(data.ReportId);
          setSpNumber(data.SpNumber);
          setLargeDataTitle(data.MasterDataList || "");
          setLargeData(!!data.IsLargeDataReport);
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
              />
            }
          />
        )}
      </Routes>
    </Suspense>
  );
}

export default function App() {
  function getBaseName() {
    const path = window.location.pathname;
    const match = path.match(/^\/([^/]+\/[^/]+)/);
    return match ? `/${match[1]}` : "/";
  }

  return (
    <RecoilRoot>
      <DeviceStatusProvider>
        <BrowserRouter basename={getBaseName()}>
          <RouterContent />
        </BrowserRouter>
      </DeviceStatusProvider>
    </RecoilRoot>
  );
}
