import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import { Box } from "@mui/material";
import "./SpliterReport.scss";
import { ReportCallApi } from "../../../../API/ReportCommonAPI/ReportCallApi";
import MainReport from "../MainReport/MainReport";
import DualDatePicker from "../../../../Utils/DatePicker/DualDatePicker";

const formatToYYYYMMDD = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function SpliterReport({
  reportId,
  spNumber,
  largeData,
  largeDataTitle,
  dateOptions,
  dateOptionsShow,
  reportName,
  spliterReportShow,
  spliterReportFirstPanel,
  spliterReportSecondPanel,
  spliterReportMonthRestiction,
  otherSpliterSideData
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [spData, setSpData] = useState(null);
  const [masterData, setMasterData] = useState();
  const [masterFields, setMasterFields] = useState({});
  const [filteredValue, setFilteredValue] = useState();
  const [selectedFirstPanelKey, setSelectedFirstPanelKey] = useState(null);
  const [selectedSecondPanelKey, setSelectedSecondPanelKey] = useState(null);
  const [filteredReportData, setFilteredReportData] = useState(null);
  const [showReportMaster, setShowReportMaster] = useState(largeData);
  const [serverSideData, setServerSider] = useState(false);
  const [searchParams] = useSearchParams();
  const [filterState, setFilterState] = useState({
    dateRange: { startDate: null, endDate: null },
  });
  const pid = searchParams.get("pid");

  const [paneWidths, setPaneWidths] = useState(
    spliterReportSecondPanel ? ["18%", "18%", "64%"] : ["18%", "82%"]
  );
  const containerRef = useRef();
  const firstTimeLoadedRef = useRef(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  useEffect(() => {
    const now = new Date();
    setFilterState({
      dateRange: {
        startDate: now,
        endDate: now,
      },
    });
    const { startDate: s, endDate: e } = filterState.dateRange;
    if (s && e) {
      setStartDate(s);
      setEndDate(e);
    }
    setTimeout(() => {
      firstTimeLoadedRef.current = true;
    }, 0);
  }, []);

  useEffect(() => {
    const today = new Date();
    setFilterState({
      dateRange: { startDate: today, endDate: today },
    });
  }, []);

  useEffect(() => {
    setShowReportMaster(largeData);
  }, [largeData]);

  useEffect(() => {
    if ((!reportId && !spNumber) || !filterState.dateRange.startDate) return;
    const fetchData = async () => {
      setIsLoading(true);
      let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

      if (largeData) {
        try {
          const body = {
            con: JSON.stringify({
              id: "",
              mode: "GetFullReport",
              appuserid: AllData?.LUId,
            }),
            p: JSON.stringify({ ReportId: reportId, IsMaster: "1" }),
            f: "DynamicReport ( get master )",
          };
          const response = await ReportCallApi(body, spNumber);

          if (response) {
            const fields = {};
            Object.keys(response).forEach((k) => {
              if (k.startsWith("rd") && Array.isArray(response[k])) {
                fields[k] = response[k];
              }
            });
            setMasterFields(fields);
          }
        } finally {
        }
      } else {
        fetchReportData({}, "0");
      }
      setIsLoading(false);
    };

    fetchData();
  }, [pid, reportId, largeData, filterState.dateRange]);

  const fetchReportData = async (filters = {}, Master) => {
    try {
      setIsLoading(true);
      let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

      const masterDataBody = {
        con: JSON.stringify({
          id: "",
          mode: "GetFullMaster",
          appuserid: AllData?.LUId,
        }),
        p: JSON.stringify({ ReportId: reportId }),
        f: "DynamicReport ( get sp list )",
      };

      const responseMaster = await ReportCallApi(masterDataBody, spNumber);
      if (responseMaster) setMasterData(responseMaster);

      const body = {
        con: JSON.stringify({
          mode: "GetFullReport",
          appuserid: AllData?.LUId,
        }),
        p: JSON.stringify({
          ReportId: reportId,
          IsMaster: Master,
          FilterStartDate: formatToYYYYMMDD(filterState.dateRange.startDate),
          FilterEndDate: formatToYYYYMMDD(filterState.dateRange.endDate),
          ...(filters.FilterHeader && { FilterHeader: filters.FilterHeader }),
          ...(filters.FilterValue && { FilterValue: filters.FilterValue }),
        }),
        f: "DynamicReport ( data )",
      };

      const response = await ReportCallApi(body, spNumber);
      setSpData(response);
      setFilteredReportData(response);

      const firstList = uniqueValuesForFirstPanel;
      if (firstList?.length > 0) {
        handleFirstPanelSelection(firstList[0]);
      }

      if (spliterReportSecondPanel) {
        const secondList = uniqueValuesForSecondPanel;
        if (secondList?.length > 0) {
          handleSecondPanelSelection(secondList[0]);
        }
      }
      setShowReportMaster(false);
    } catch (error) {
      console.error("getReportData failed:", error);
    }
    setIsLoading(false);
  };

  const uniqueValuesForFirstPanel = useMemo(() => {
    if (!spData?.rd2 || !spData?.rd3) return [];
    const map = spData.rd2[0];
    const key = Object.keys(map).find(
      (k) => map[k] === spliterReportFirstPanel
    );

    if (!key) return [];
    return [...new Set(spData.rd3.map((x) => x[key]))];
  }, [spData, spliterReportFirstPanel]);

  const uniqueValuesForSecondPanel = useMemo(() => {
    if (!spliterReportSecondPanel || !spData?.rd2 || !spData?.rd3) return [];

    const map = spData.rd2[0];
    const key = Object.keys(map).find(
      (k) => map[k] === spliterReportSecondPanel
    );
    if (!key) return [];

    return [...new Set(spData.rd3.map((x) => x[key]))];
  }, [spData, spliterReportSecondPanel]);

  useEffect(() => {
    if (
      spData &&
      uniqueValuesForFirstPanel.length > 0 &&
      selectedFirstPanelKey == null
    ) {
      handleFirstPanelSelection(uniqueValuesForFirstPanel[0]);
    }
  }, [spData, uniqueValuesForFirstPanel]);

  useEffect(() => {
    if (
      spliterReportSecondPanel &&
      spData &&
      selectedFirstPanelKey !== null &&
      uniqueValuesForSecondPanel.length > 0 &&
      selectedSecondPanelKey == null
    ) {
      handleSecondPanelSelection(uniqueValuesForSecondPanel[0]);
    }
  }, [spData, selectedFirstPanelKey, uniqueValuesForSecondPanel]);

  const handleFirstPanelSelection = (value) => {
    setSelectedFirstPanelKey(value);
    setSelectedSecondPanelKey(null);

    const map = spData?.rd2?.[0];
    const key = Object.keys(map).find(
      (k) => map[k] === spliterReportFirstPanel
    );
    if (!key) return;
    const rows = spData.rd3.filter((r) => r[key] === value);
    setFilteredReportData({ ...spData, rd3: rows });
  };

  const handleSecondPanelSelection = (value) => {
    setSelectedSecondPanelKey(value);
    const map = spData?.rd2?.[0];
    const firstKey = Object.keys(map).find(
      (k) => map[k] === spliterReportFirstPanel
    );
    const secondKey = Object.keys(map).find(
      (k) => map[k] === spliterReportSecondPanel
    );
    if (!firstKey || !secondKey) return;
    const rows = spData.rd3.filter(
      (r) => r[firstKey] === selectedFirstPanelKey && r[secondKey] === value
    );
    setFilteredReportData({ ...spData, rd3: rows });
  };

  const handleDrag = (index, e) => {
    const startX = e.clientX;
    const start = paneWidths.map((x) => parseFloat(x));
    const cw = containerRef.current.offsetWidth;

    const move = (m) => {
      const delta = ((m.clientX - startX) / cw) * 100;
      const w = [...start];
      w[index] = Math.max(5, start[index] + delta);
      w[index + 1] = Math.max(5, start[index + 1] - delta);

      if (w.reduce((a, b) => a + b, 0) <= 100)
        setPaneWidths(w.map((x) => `${x}%`));
    };
    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const buildMasterValueMap = (mData) => {
    const map = {};
    Object.keys(mData || {}).forEach((key) => {
      if (key.startsWith("rd") && key !== "rd") {
        (mData[key] || []).forEach((item) => {
          if (item?.MasterId) {
            if (!map[item.MasterId]) map[item.MasterId] = {};
            map[item.MasterId][item.id] = item.ValName;
          }
        });
      }
    });
    return map;
  };

  const masterValueMap = useMemo(
    () => (masterData ? buildMasterValueMap(masterData) : {}),
    [masterData]
  );

  const getDisplayValue = (rawValue, columnName) => {
    if (!masterData || !rawValue) return rawValue;

    const masterInfo =
      spData?.rd1?.find((c) => c.FieldName === columnName) ||
      spData?.rd2?.find((c) => c.FieldName === columnName) ||
      spData?.rd3?.find((c) => c.FieldName === columnName) ||
      spData?.rd4?.find((c) => c.FieldName === columnName);

    if (!masterInfo?.MasterId || masterInfo.MasterId === 0) return rawValue;

    return masterValueMap[masterInfo.MasterId]?.[rawValue] ?? rawValue;
  };
  const filteredColumns = filteredReportData?.rd1?.filter((col) =>
    spliterReportFirstPanel.includes(col.FieldName)
  );
  
  const filteredColumns2 = filteredReportData?.rd1?.filter((col) =>
    spliterReportSecondPanel.includes(col.FieldName)
  );
  console.log('otherSpliterSideData', otherSpliterSideData);
  return (
    <DragDropContext onDragEnd={() => {}}>
      <Box
        sx={{ height: "100vh", display: "flex", flexDirection: "row" }}
        ref={containerRef}
      >
        <div className="pane" style={{ width: paneWidths[0], padding: 8 }}>
          <div>
            <div
              style={{
                margin: "5px 0px 5px 5px",
                height: "8vh",
              }}
            >
              <DualDatePicker
                filterState={filterState}
                setFilterState={setFilterState}
                validDay={spliterReportMonthRestiction * 31}
                validMonth={spliterReportMonthRestiction}
                withountDateFilter={false}
                hideDisplay={
                  filterState.dateRange.startDate?.getFullYear?.() === 1990
                }
              />
              <p className="reportSpliter_top_headername">
                {Array.isArray(filteredColumns) &&
                  filteredColumns.length > 0 &&
                  filteredColumns[0]?.HeaderName}
              </p>
            </div>
            <div className="spliter1_maindiv">
              {uniqueValuesForFirstPanel.map((v) => (
                <div
                  key={v}
                  onClick={() => handleFirstPanelSelection(v)}
                  style={{
                    background:
                      selectedFirstPanelKey === v
                        ? "linear-gradient(270deg,#7367f0b3,#7367f0)"
                        : "#f5f5f5",
                    fontWeight: selectedFirstPanelKey === v ? "600" : "400",
                    color: selectedFirstPanelKey === v ? "white" : "black",
                  }}
                  className="spliter1_showname"
                >
                  {getDisplayValue(v, spliterReportFirstPanel)}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="splitter" onMouseDown={(e) => handleDrag(0, e)} />
        {spliterReportSecondPanel && (
          <>
            <div className="pane" style={{ width: paneWidths[1], padding: 8 }}>
              <div className="spliter1_maindiv">
                <p className="reportSpliter_top_headername">
                  {Array.isArray(filteredColumns2) &&
                    filteredColumns2.length > 0 &&
                    filteredColumns2[0]?.HeaderName}
                </p>
                {uniqueValuesForSecondPanel.map((v) => (
                  <div
                    key={v}
                    onClick={() => handleSecondPanelSelection(v)}
                    style={{
                      background:
                        selectedSecondPanelKey === v
                          ? "linear-gradient(270deg,#7367f0b3,#7367f0)"
                          : "#f5f5f5",
                      color: selectedSecondPanelKey === v ? "white" : "black",
                      fontWeight: selectedSecondPanelKey === v ? "600" : "400",
                    }}
                    className="spliter1_showname"
                  >
                    {getDisplayValue(v, spliterReportSecondPanel)}
                  </div>
                ))}
              </div>
            </div>
            <div className="splitter" onMouseDown={(e) => handleDrag(1, e)} />
          </>
        )}
        <div className="pane" style={{ width: paneWidths.at(-1) }}>
          <MainReport
            OtherKeyData={filteredReportData || spData}
            masterData={masterData}
            onBack={() => setShowReportMaster(true)}
            showBackErrow={largeData}
            filteredValue={filteredValue}
            spNumber={spNumber}
            onSearchFilter={fetchReportData}
            serverSideData={serverSideData}
            isLoadingChek={isLoading}
            reportName={reportName}
            spliterReportShow={spliterReportShow}
          />
        </div>
      </Box>
    </DragDropContext>
  );
}
