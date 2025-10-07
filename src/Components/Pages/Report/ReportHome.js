import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Skeleton,
  Snackbar,
} from "@mui/material";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import CloseIcon from "@mui/icons-material/Close";
import "./ReportHome.scss";
import { ArrowRight } from "lucide-react";
import MainReport from "./MainReport/MainReport";
import { ReportCallApi } from "../../../API/ReportCommonAPI/ReportCallApi";

const SelectionBox = ({
  title,
  data,
  selected = [],
  setSelected,
  clearAll,
  loading,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const boxRef = useRef(null);

  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        const keyName = Object.keys(item)[0];
        const strValue = item[keyName]?.toString()?.trim().toLowerCase();
        return item[keyName]
          ?.toString()
          .toLowerCase()
          .includes(search.toLowerCase());
      })
      .sort((a, b) => {
        const keyA = Object.keys(a)[0];
        const keyB = Object.keys(b)[0];
        const valA = a[keyA]?.toString().toLowerCase() || "";
        const valB = b[keyB]?.toString().toLowerCase() || "";
        return valA.localeCompare(valB);
      });
  }, [data, search]);

  const displayData = showAll ? filteredData : filteredData.slice(0, 10);

  const handleScroll = () => {
    if (boxRef.current) setShowScrollTop(boxRef.current.scrollTop > 100);
  };

  return (
    <div className="selection-box">
      <div className="selection-header">
        <p className="selection-title">{title}</p>
        {selected.length > 0 && (
          <div className="selection-actions">
            <div className="count-chip">{selected.length}</div>
            <Button
              size="small"
              color="error"
              onClick={clearAll}
              sx={{ textTransform: "none", fontSize: "12px", ml: 1 }}
              className="section_Btn"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      <div className="master-box">
        <div className="search-bar">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${title}...`}
          />
          {search && (
            <IconButton
              size="small"
              onClick={() => setSearch("")}
              className="clear-btn"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </div>

        {loading && data.length === 0 ? (
          Array.from(new Array(6)).map((_, idx) => (
            <div
              key={idx}
              style={{ display: "flex", alignItems: "center", marginBottom: 8 }}
            >
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton
                variant="text"
                width={120}
                height={24}
                style={{ marginLeft: 8 }}
              />
            </div>
          ))
        ) : (
          <div ref={boxRef} onScroll={handleScroll}>
            {displayData.length > 0 ? (
              displayData.map((item, idx) => {
                const keyName = Object.keys(item)[0];
                const value = item[keyName];
                const strValue = value?.toString().trim();

                let actualValue = "";
                if (item.MasterId === "0" || item.MasterId === 0) {
                  actualValue = item[item.MasterType];
                } else {
                  const idKey = Object.keys(item).find(
                    (k) => k.toLowerCase().includes("id") && k !== "MasterId"
                  );
                  actualValue = item[idKey];
                }

                const isChecked = selected.includes(actualValue);

                return (
                  <label
                    key={idx}
                    className={`master-item ${isChecked ? "selected" : ""}`}
                    style={{ cursor: "pointer" }}
                  >
                    <Checkbox
                      checked={isChecked}
                      onChange={() => setSelected(item)}
                      sx={{ padding: "2px" }}
                    />
                    <span>{strValue}</span>
                  </label>
                );
              })
            ) : (
              <div style={{ padding: "8px", fontSize: "12px", color: "#999" }}>
                No data found
              </div>
            )}

            {filteredData.length > 10 && (
              <button
                className="show-more-btn"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ReportHome({
  reportId,
  spNumber,
  largeData,
  largeDataTitle,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [spData, setSpData] = useState(null);
  const [masterData, setMasterData] = useState();
  const [masterFields, setMasterFields] = useState({});
  const [selectedValues, setSelectedValues] = useState({});
  const [showReportMaster, setShowReportMaster] = useState(largeData);
  const [serverSideData, setServerSider] = useState(false);
  const masterRef = useRef(null);
  const reportRef = useRef(null);
  const [searchParams] = useSearchParams();
  const pid = searchParams.get("pid");
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [filteredValue, setFilteredValue] = useState();

  useEffect(() => {
    setShowReportMaster(largeData);
  }, [largeData]);

  const clearFieldSelections = (fieldKey) => {
    setSelectedValues((prev) => ({
      ...prev,
      [fieldKey]: [],
    }));
  };

  const parsedTitles = React.useMemo(() => {
    if (!largeDataTitle) return [];
    return largeDataTitle
      .split(",")
      .map((part) => {
        const [field, friendly] = part.split("{#}");
        return {
          field: field?.trim(),
          title: (friendly || field)?.trim(),
        };
      })
      .filter((x) => x.field);
  }, [largeDataTitle]);

  useEffect(() => {
    if (!reportId && !spNumber) return;
    const fetchData = async () => {
      setIsLoading(true);
      let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
      if (largeData) {
        try {
          setLoadingMaster(true);
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
          setIsLoading(false);
        } catch (err) {
          console.error("fetchMasterFields failed", err);
        } finally {
          setLoadingMaster(false);
        }
      } else {
        fetchReportData({}, "0");
      }
    };
    fetchData();
  }, [pid, reportId, largeData]);

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
        p: JSON.stringify({
          ReportId: reportId,
        }),
        f: "DynamicReport ( get sp list )",
      };

      const responseMaster = await ReportCallApi(masterDataBody, spNumber);
      if (responseMaster) {
        setMasterData(responseMaster);
      }

      const body = {
        con: JSON.stringify({
          mode: "GetFullReport",
          appuserid: AllData?.uid,
        }),
        p: JSON.stringify({
          ReportId: reportId,
          IsMaster: Master,
          ...(filters.FilterHeader && { FilterHeader: filters.FilterHeader }),
          ...(filters.FilterValue && { FilterValue: filters.FilterValue }),
        }),
        f: "DynamicReport ( data )",
      };
      const response = await ReportCallApi(body, spNumber);
      if (Master === "-1") {
        const filtersArray = [];
        if (filters.FilterHeader && filters.FilterValue) {
          const headers = filters.FilterHeader.split("#");
          const values = filters.FilterValue.split("#");
          headers.forEach((header, index) => {
            filtersArray.push({ name: header, value: values[index] || "" });
          });
        }
        const merged = [...filtersArray];
        const uniqueMerged = merged.reduce((acc, cur) => {
          const exists = acc.find((item) => item.name === cur.name);
          if (exists) {
            acc = acc.map((item) => (item.name === cur.name ? cur : item));
          } else {
            acc.push(cur);
          }
          return acc;
        }, []);
        setFilteredValue(uniqueMerged);
        setServerSider(true);
      } else if (Master === "2") {
        setFilteredValue();
      }

      if (response?.rd[0]?.stat == 0) {
        if (response?.rd[0]?.stat_msg == '"Contact yours Admin"') {
          setErrorMessage("Contact yours Admin");
          setOpenSnackbar(true);
        } else {
          setErrorMessage("please narrow your search");
          setOpenSnackbar(true);
        }
      } else if (response?.rd[0]?.stat == 2) {
        setErrorMessage("No Records Found");
        setOpenSnackbar(true);
      } else {
        setSpData(response);
        setIsLoading(false);
        setShowReportMaster(false);
      }
    } catch (error) {
      console.error("getReportData failed:", error);
    }
  };

  const handleSelection = (fieldKey, item) => {
    const masterType = item.MasterType;
    let actualValue = "";
    if (item.MasterId === "0" || item.MasterId === 0) {
      actualValue = item[masterType];
    } else {
      const idKey = Object.keys(item).find(
        (k) => k.toLowerCase().includes("id") && k !== "MasterId"
      );
      actualValue = item[idKey];
    }

    setSelectedValues((prev) => {
      const current = prev[masterType] || [];
      const alreadySelected = current.includes(actualValue);
      return {
        ...prev,
        [masterType]: alreadySelected
          ? current.filter((v) => v !== actualValue)
          : [...current, actualValue],
      };
    });
  };

  const handleSave = () => {
    const activeSelections = Object.entries(selectedValues).filter(
      ([, v]) => Array.isArray(v) && v.length > 0
    );
    if (!activeSelections.length) {
      alert("Please select at least one record before saving.");
      return;
    }

    let FilterHeaders = [];
    let FilterValues = [];
    let formattedSelections = [];

    activeSelections.forEach(([header, values]) => {
      FilterHeaders.push(header);
      FilterValues.push(values.join(","));
      const friendlyName = Object.values(masterFields)
        .flat()
        .find((obj) => obj.MasterType === header)?.FriendlyName;
      formattedSelections.push({
        name: friendlyName?.trim() || header,
        value: values.join(","),
      });
    });

    const FilterHeader = FilterHeaders.join("#");
    const FilterValue = FilterValues.join("#");
    setFilteredValue(formattedSelections);
    fetchReportData({ FilterHeader, FilterValue }, "0");
  };

  const handleBack = () => {
    setShowReportMaster(true);
  };

  return (
    <DragDropContext onDragEnd={() => {}}>
      <SwitchTransition>
        <CSSTransition
          key={showReportMaster ? "master" : "report"}
          timeout={600}
          classNames="fade-slide"
          nodeRef={showReportMaster ? masterRef : reportRef}
        >
          {showReportMaster ? (
            <div ref={masterRef} className="master-container">
              <div className="report_master_header">
                <p className="topHeader_title">Report Filter Panel</p>
              </div>

              <Container
                sx={{
                  maxWidth: "95% !important",
                  margin: "10px auto",
                  height: "85vh",
                }}
              >
                <Grid container spacing={2}>
                  {parsedTitles.map(({ field, title }, idx) => {
                    const dataArray =
                      Object.values(masterFields).find((arr) =>
                        arr.some((item) => item.hasOwnProperty(field))
                      ) || [];

                    return (
                      <Grid item key={idx}>
                        <SelectionBox
                          title={title}
                          data={dataArray}
                          selected={selectedValues[field] || []}
                          setSelected={(val) => handleSelection(field, val)}
                          clearAll={() => clearFieldSelections(field)}
                          loading={loadingMaster}
                        />
                      </Grid>
                    );
                  })}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginLeft: "20px",
                      width:
                        Object.entries(masterFields).length % 5 === 0 && "100%",
                      justifyContent:
                        Object.entries(masterFields).length % 5 === 0 &&
                        "center",
                      margin:
                        Object.entries(masterFields).length % 5 === 0 && "20px",
                    }}
                  >
                    <Button
                      className="Btn_Show_Report"
                      disableElevation
                      onClick={handleSave}
                    >
                      <p>Show Report</p>
                      <ArrowRight />
                    </Button>
                  </div>
                </Grid>
              </Container>
            </div>
          ) : (
            <div ref={reportRef} className="report-container">
              <MainReport
                OtherKeyData={spData}
                masterData={masterData}
                onBack={handleBack}
                showBackErrow={largeData}
                filteredValue={filteredValue}
                spNumber={spNumber}
                onSearchFilter={fetchReportData}
                serverSideData={serverSideData}
                isLoadingChek={isLoading}
              />
            </div>
          )}
        </CSSTransition>
      </SwitchTransition>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setOpenSnackbar(false)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </DragDropContext>
  );
}
