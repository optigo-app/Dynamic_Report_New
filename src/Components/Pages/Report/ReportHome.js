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

  const displayData = showAll ? filteredData : filteredData.slice(0, 100);
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
                if (!strValue) {
                  return;
                }
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

            {filteredData.length > 100 && (
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
  dateOptions,
  dateOptionsShow,
  reportName,
  colorMaster,
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
  const [errorMessage, setErrorMessage] = useState();
  const [errorMessageColor, setErrorMessageColor] = useState("error");
  const [filteredValue, setFilteredValue] = useState();
  const [selectedDateOption, setSelectedDateOption] = useState("");

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
        p: JSON.stringify({ ReportId: reportId }),
        f: "DynamicReport ( get sp list )",
      };

      const responseMaster = await ReportCallApi(masterDataBody, spNumber);
      if (responseMaster) setMasterData(responseMaster);
      let FilterHeader = "";
      let FilterValue = "";
      let ServerFilterHeader = "";
      let ServerFilterValue = "";

      if (Array.isArray(filters) && filters.length > 0) {
        const normalFilters = filters.filter(
          (f) => f.FilterHeader && f.FilterValue
        );
        const serverFilters = filters.filter(
          (f) => f.ServerFilterHeader && f.ServerFilterValue
        );

        FilterHeader = normalFilters.map((f) => f.FilterHeader).join("#");
        FilterValue = normalFilters.map((f) => f.FilterValue).join("#");

        ServerFilterHeader = serverFilters
          .map((f) => f.ServerFilterHeader)
          .join("#");
        ServerFilterValue = serverFilters
          .map((f) => f.ServerFilterValue)
          .join("#");
      } else if (filters.FilterHeader || filters.ServerFilterHeader) {
        FilterHeader = filters.FilterHeader || "";
        FilterValue = filters.FilterValue || "";
        ServerFilterHeader = filters.ServerFilterHeader || "";
        ServerFilterValue = filters.ServerFilterValue || "";
      }

      // ----------- Build API Body ----------
      const body = {
        con: JSON.stringify({
          mode: "GetFullReport",
          appuserid: AllData?.LUId,
        }),
        p: JSON.stringify({
          ReportId: reportId,
          IsMaster: Master,
          ...(FilterHeader && { FilterHeader }),
          ...(FilterValue && { FilterValue }),
          ...(ServerFilterHeader && { ServerFilterHeader }),
          ...(ServerFilterValue && { ServerFilterValue }),
          ...(filters.FilterStartDate && {
            FilterStartDate: filters.FilterStartDate,
          }),
          ...(filters.FilterEndDate && {
            FilterEndDate: filters.FilterEndDate,
          }),
        }),
        f: "DynamicReport ( data )",
      };
      const response = await ReportCallApi(body, spNumber);
      if (Master === "-1") {
        const filtersArray = [];
        const mapFilters = (header, value) => {
          if (!header || !value) return [];
          const h = header.split("#");
          const v = value.split("#");
          return h.map((x, i) => ({ name: x, value: v[i] || "" }));
        };
        filtersArray.push(
          ...mapFilters(FilterHeader, FilterValue),
          ...mapFilters(ServerFilterHeader, ServerFilterValue)
        );
        setFilteredValue(filtersArray);
        setServerSider(true);
      }

      if (response?.rd[0]?.stat == 0) {
        setErrorMessageColor("warning");
        setErrorMessage(
          `Found ${response?.rd[0]?.ActualCount} records, limit ${response?.rd[0]?.LargeDataCount}. Please narrow your filters.`
        );
        setOpenSnackbar(true);
      } else if (response?.rd[0]?.stat == 2) {
        setErrorMessageColor("error");
        setErrorMessage("No Records Found");
        setOpenSnackbar(true);
      } else {
        setSpData(response);
        setShowReportMaster(false);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("getReportData failed:", error);
      setIsLoading(false);
    }
  };

  // const fetchReportData = async (filters = {}, Master) => {
  //   try {
  //     setIsLoading(true);
  //     let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
  //     const masterDataBody = {
  //       con: JSON.stringify({
  //         id: "",
  //         mode: "GetFullMaster",
  //         appuserid: AllData?.LUId,
  //       }),
  //       p: JSON.stringify({
  //         ReportId: reportId,
  //       }),
  //       f: "DynamicReport ( get sp list )",
  //     };

  //     const responseMaster = await ReportCallApi(masterDataBody, spNumber);
  //     if (responseMaster) {
  //       setMasterData(responseMaster);
  //     }

  //     let FilterHeader = "";
  //     let FilterValue = "";
  //     let ServerFilterHeader = "";
  //     let ServerFilterValue = "";

  //     if (Array.isArray(filters) && filters.length > 0) {
  //       const normalFilters = filters.filter(
  //         (f) => f.FilterHeader && f.FilterValue
  //       );
  //       const serverFilters = filters.filter(
  //         (f) => f.ServerFilterHeader && f.ServerFilterValue
  //       );

  //       FilterHeader = normalFilters.map((f) => f.FilterHeader).join("#");
  //       FilterValue = normalFilters.map((f) => f.FilterValue).join("#");

  //       ServerFilterHeader = serverFilters
  //         .map((f) => f.ServerFilterHeader)
  //         .join("#");
  //       ServerFilterValue = serverFilters
  //         .map((f) => f.ServerFilterValue)
  //         .join("#");
  //     }
  //     else if (filters.FilterHeader && filters.FilterValue) {
  //       FilterHeader = filters.FilterHeader;
  //       FilterValue = filters.FilterValue;
  //       ServerFilterHeader = filters.ServerFilterHeader || "";
  //       ServerFilterValue = filters.ServerFilterValue || "";
  //     }

  //     const body = {
  //       con: JSON.stringify({
  //         mode: "GetFullReport",
  //         appuserid: AllData?.LUId,
  //       }),
  //       p: JSON.stringify({
  //         ReportId: reportId,
  //         IsMaster: Master,
  //         ...(FilterHeader && { FilterHeader }),
  //         ...(FilterValue && { FilterValue }),
  //         ...(ServerFilterHeader && { ServerFilterHeader }),
  //         ...(ServerFilterValue && { ServerFilterValue }),
  //         ...(filters.FilterStartDate && {
  //           FilterStartDate: filters.FilterStartDate,
  //         }),
  //         ...(filters.FilterEndDate && {
  //           FilterEndDate: filters.FilterEndDate,
  //         }),
  //       }),
  //       f: "DynamicReport ( data )",
  //     };
  //     const response = await ReportCallApi(body, spNumber);
  //     if (Master === "-1") {
  //       const filtersArray = [];
  //       if (FilterHeader && FilterValue) {
  //         const headers = FilterHeader.split("#");
  //         const values = FilterValue.split("#");
  //         headers.forEach((header, i) =>
  //           filtersArray.push({ name: header, value: values[i] || "" })
  //         );
  //       }
  //       setFilteredValue(filtersArray);
  //       setServerSider(true);
  //     }

  //     if (response?.rd[0]?.stat == 0) {
  //       setErrorMessageColor("warning");
  //       setErrorMessage(
  //         `Found ${response?.rd[0]?.ActualCount} records, limit ${response?.rd[0]?.LargeDataCount}. Please narrow your filters.`
  //       );
  //       setOpenSnackbar(true);
  //     } else if (response?.rd[0]?.stat == 2) {
  //       setErrorMessageColor("error");
  //       setErrorMessage("No Records Found");
  //       setOpenSnackbar(true);
  //     } else {
  //       setSpData(response);
  //       setShowReportMaster(false);
  //     }

  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error("getReportData failed:", error);
  //     setIsLoading(false);
  //   }
  // };

  // const fetchReportData = async (filters = {}, Master) => {
  //   try {
  //     setIsLoading(true);
  //     let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
  //     const masterDataBody = {
  //       con: JSON.stringify({
  //         id: "",
  //         mode: "GetFullMaster",
  //         appuserid: AllData?.LUId,
  //       }),
  //       p: JSON.stringify({
  //         ReportId: reportId,
  //       }),
  //       f: "DynamicReport ( get sp list )",
  //     };

  //     const responseMaster = await ReportCallApi(masterDataBody, spNumber);
  //     if (responseMaster) {
  //       setMasterData(responseMaster);
  //     }

  //     const body = {
  //       con: JSON.stringify({
  //         mode: "GetFullReport",
  //         appuserid: AllData?.LUId,
  //       }),
  //       p: JSON.stringify({
  //         ReportId: reportId,
  //         IsMaster: Master,
  //         ...(filters.FilterHeader && { FilterHeader: filters.FilterHeader }),
  //         ...(filters.FilterValue && { FilterValue: filters.FilterValue }),
  //         ...(filters.FilterStartDate && {
  //           FilterStartDate: filters.FilterStartDate,
  //         }),
  //         ...(filters.FilterEndDate && {
  //           FilterEndDate: filters.FilterEndDate,
  //         }),
  //       }),
  //       f: "DynamicReport ( data )",
  //     };

  //     const response = await ReportCallApi(body, spNumber);
  //     if (Master === "-1") {
  //       const filtersArray = [];
  //       if (filters.FilterHeader && filters.FilterValue) {
  //         const headers = filters.FilterHeader.split("#");
  //         const values = filters.FilterValue.split("#");
  //         headers.forEach((header, index) => {
  //           filtersArray.push({ name: header, value: values[index] || "" });
  //         });
  //       }
  //       const merged = [...filtersArray];
  //       const uniqueMerged = merged.reduce((acc, cur) => {
  //         const exists = acc.find((item) => item.name === cur.name);
  //         if (exists) {
  //           acc = acc.map((item) => (item.name === cur.name ? cur : item));
  //         } else {
  //           acc.push(cur);
  //         }
  //         return acc;
  //       }, []);
  //       setFilteredValue(uniqueMerged);
  //       setServerSider(true);
  //       setIsLoading(false);
  //     } else if (Master === "2") {
  //       setFilteredValue();
  //     }

  //     if (response?.rd[0]?.stat == 0) {
  //       if (response?.rd[0]?.stat_msg == '"Contact yours Admin"') {
  //         setErrorMessageColor("error");
  //         setErrorMessage("Contact yours Admin");
  //         setOpenSnackbar(true);
  //         setIsLoading(false);
  //       } else {
  //         setErrorMessageColor("warning");
  //         setErrorMessage(
  //           `Found ${response?.rd[0]?.ActualCount} records, limit is ${response?.rd[0]?.LargeDataCount}. Please narrow your filters.`
  //         );
  //         setOpenSnackbar(true);
  //         setIsLoading(false);
  //       }
  //     } else if (response?.rd[0]?.stat == 2) {
  //       setErrorMessageColor("error");
  //       setErrorMessage("No Records Found");
  //       setOpenSnackbar(true);
  //       setIsLoading(false);
  //     } else {
  //       setSpData(response);
  //       setIsLoading(false);
  //       setShowReportMaster(false);
  //       setIsLoading(false);
  //     }
  //   } catch (error) {
  //     console.error("getReportData failed:", error);
  //   }
  // };

  const handleDateSelection = (option) => {
    setSelectedDateOption((prev) => (prev === option ? "" : option));
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

  const getDateRange = (option) => {
    const today = new Date();
    let startDate = null;
    let endDate = null;

    switch (option) {
      case "Today":
        startDate = endDate = today;
        break;
      case "Yesterday":
        startDate = endDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        break;
      case "This Week": {
        const day = today.getDay(); // 0 (Sun) to 6 (Sat)
        startDate = new Date(today);
        startDate.setDate(today.getDate() - day);
        endDate = today;
        break;
      }
      case "Last Week": {
        const day = today.getDay();
        endDate = new Date(today);
        endDate.setDate(today.getDate() - day - 1);
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 6);
        break;
      }
      case "Last 7 Days":
        endDate = today;
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        break;
      case "This Month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        break;
      case "Last Month":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "Last 3 Month":
        endDate = today;
        startDate = new Date(
          today.getFullYear(),
          today.getMonth() - 3,
          today.getDate() + 1
        );
        break;
      case "Last 6 Month":
        endDate = today;
        startDate = new Date(
          today.getFullYear(),
          today.getMonth() - 6,
          today.getDate() + 1
        );
        break;
      case "1 Year":
        endDate = today;
        startDate = new Date(
          today.getFullYear() - 1,
          today.getMonth(),
          today.getDate() + 1
        );
        break;
      default:
        break;
    }

    const format = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;

    return startDate && endDate
      ? { FilterStartDate: format(startDate), FilterEndDate: format(endDate) }
      : {};
  };

  // const handleSave = () => {
  //   const activeSelections = Object.entries(selectedValues).filter(
  //     ([, v]) => Array.isArray(v) && v.length > 0
  //   );
  //   if (!activeSelections.length) {
  //     alert("Please select at least one record before saving.");
  //     return;
  //   }

  //   let FilterHeaders = [];
  //   let FilterValues = [];
  //   let formattedSelections = [];

  //   activeSelections.forEach(([header, values]) => {
  //     FilterHeaders.push(header);

  //     // Find matching field group (like rd2)
  //     const fieldGroup = Object.values(masterFields)
  //       .flat()
  //       .filter((obj) => obj.MasterType === header);

  //     // Try to find display values (for UI) from masterFields
  //     const displayValues = values
  //       .map((val) => {
  //         const match = fieldGroup.find((obj) => {
  //           // match either by ID or by direct value
  //           const idKey = Object.keys(obj).find(
  //             (k) => k.toLowerCase().includes("id") && k !== "MasterId"
  //           );
  //           return (
  //             obj[idKey] == val ||
  //             obj[header] == val ||
  //             obj[obj.MasterType] == val
  //           );
  //         });
  //         if (match) {
  //           // pick the first readable value (not MasterType/Id)
  //           const displayKey = Object.keys(match).find(
  //             (k) =>
  //               !["MasterId", "MasterType", "FriendlyName"].includes(k) &&
  //               !k.toLowerCase().includes("id")
  //           );
  //           return match[displayKey] || val;
  //         }
  //         return val;
  //       })
  //       .filter(Boolean);

  //     FilterValues.push(values.join(","));
  //     const friendlyName = fieldGroup?.[0]?.FriendlyName || header;

  //     formattedSelections.push({
  //       name: friendlyName?.trim() || header,
  //       value: displayValues.join(","),
  //     });
  //   });

  //   const FilterHeader = FilterHeaders.join("#");
  //   const FilterValue = FilterValues.join("#");
  //   setFilteredValue(formattedSelections);
  //   fetchReportData({ FilterHeader, FilterValue }, "0");
  // };

  const handleSave = () => {
    const activeSelections = Object.entries(selectedValues).filter(
      ([, v]) => Array.isArray(v) && v.length > 0
    );

    if (!activeSelections.length && !selectedDateOption) {
      alert("Please select at least one record or date before saving.");
      return;
    }

    let FilterHeaders = [];
    let FilterValues = [];
    let formattedSelections = [];

    activeSelections.forEach(([header, values]) => {
      FilterHeaders.push(header);

      const fieldGroup = Object.values(masterFields)
        .flat()
        .filter((obj) => obj.MasterType === header);

      const displayValues = values
        .map((val) => {
          const match = fieldGroup.find((obj) => {
            const idKey = Object.keys(obj).find(
              (k) => k.toLowerCase().includes("id") && k !== "MasterId"
            );
            return (
              obj[idKey] == val ||
              obj[header] == val ||
              obj[obj.MasterType] == val
            );
          });
          if (match) {
            const displayKey = Object.keys(match).find(
              (k) =>
                !["MasterId", "MasterType", "FriendlyName"].includes(k) &&
                !k.toLowerCase().includes("id")
            );
            return match[displayKey] || val;
          }
          return val;
        })
        .filter(Boolean);

      FilterValues.push(values.join(","));
      const friendlyName = fieldGroup?.[0]?.FriendlyName || header;

      formattedSelections.push({
        name: friendlyName?.trim() || header,
        value: displayValues.join(","),
      });
    });

    // 🔹 Handle Date Filters
    const dateFilters = getDateRange(selectedDateOption);

    if (
      selectedDateOption &&
      dateFilters?.FilterStartDate &&
      dateFilters?.FilterEndDate
    ) {
      formattedSelections.push({
        name: "Date",
        value: `${selectedDateOption} (${dateFilters.FilterStartDate} → ${dateFilters.FilterEndDate})`,
      });
    }

    const FilterHeader = FilterHeaders.join("#");
    const FilterValue = FilterValues.join("#");

    // 🔹 Update display filter list
    setFilteredValue(formattedSelections);

    // 🔹 Call API (normal filters only)
    fetchReportData(
      {
        FilterHeader,
        FilterValue,
        ...dateFilters,
      },
      "0"
    );
  };

  const handleBack = () => {
    setShowReportMaster(true);
  };
  return (
    <DragDropContext onDragEnd={() => {}}>
      {/* {isLoading && (
        <div className="loader-overlay">
          <CircularProgress className="loadingBarManage" />
        </div>
      )} */}
      <SwitchTransition>
        <CSSTransition
          key={showReportMaster ? "master" : "report"}
          timeout={600}
          classNames="fade-slide"
          nodeRef={showReportMaster ? masterRef : reportRef}
          style={{
            overflow: "hidden",
          }}
        >
          {showReportMaster ? (
            <div ref={masterRef} className="master-container">
              <div className="report_master_header">
                <p className="topHeader_title">Report Filter Panel</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "20px",
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
              </div>

              <div className="reportOption_main">
                {dateOptionsShow && (
                  <Grid item>
                    <div className="selection-box">
                      <div
                        className="selection-header"
                        style={{
                          minHeight: "50px",
                          borderBottom: " 1px solid #ddd",
                          padding: "6px 6px 10px 6px",
                        }}
                      >
                        <p
                          className="selection-title"
                          style={{
                            width: "100%",
                            maxWidth: "100%",
                            textAlign: "center",
                          }}
                        >
                          Date
                        </p>
                      </div>
                      <div
                        className="master-box"
                        style={{ maxHeight: "310px" }}
                      >
                        {loadingMaster ? (
                          Array.from(new Array(6)).map((_, idx) => (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 8,
                              }}
                            >
                              <Skeleton
                                variant="circular"
                                width={24}
                                height={24}
                              />
                              <Skeleton
                                variant="text"
                                width={120}
                                height={24}
                                style={{ marginLeft: 8 }}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="dateOption">
                            <div>
                              {dateOptions.filter((option) => option.IsOn)
                                .length > 0 ? (
                                dateOptions
                                  .filter((option) => option.IsOn)
                                  .map((option) => (
                                    <label
                                      key={option.DateFrameId}
                                      className="master-item"
                                      style={{
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Checkbox
                                        sx={{ padding: "2px" }}
                                        checked={
                                          selectedDateOption ===
                                          option.DateFrame
                                        }
                                        onChange={() =>
                                          handleDateSelection(option.DateFrame)
                                        }
                                      />
                                      <span>{option.DateFrame}</span>
                                    </label>
                                  ))
                              ) : (
                                <p
                                  style={{ textAlign: "center", color: "#888" }}
                                >
                                  No date options available
                                </p>
                              )}
                            </div>
                          </div>
                        )}{" "}
                      </div>
                    </div>
                  </Grid>
                )}
                {parsedTitles?.map(({ field, title }, idx) => {
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
              </div>
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
                reportName={reportName}
                colorMaster={colorMaster}
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
        style={{
          zIndex: 999999999,
        }}
      >
        <Alert
          severity={errorMessageColor}
          onClose={() => setOpenSnackbar(false)}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </DragDropContext>
  );
}
