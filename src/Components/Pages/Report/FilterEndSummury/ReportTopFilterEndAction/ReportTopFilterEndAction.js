import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  alpha,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { MdExpandMore, MdOutlineFilterAlt } from "react-icons/md";
import { ChartNoAxesCombined, FileSpreadsheet, Image, LayoutGrid, Pencil, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { FaPrint } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import CustomDualDatePicker from "../../../../../Utils/CustomDualDatePicker/CustomDualDatePicker";
import { CallApi } from "../../../../../API/CallApi/CallApi";
import MakeNewReport from "./MakeNewReport";

const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";

const ReportTopFilterEndAction = ({
  isLoading,
  toggleDrawer,
  spliterReportShow,
  masterKeyData,
  selectedDateColumn,
  setSelectedDateColumn,
  dateColumnOptions,
  filterState,
  setFilterState,
  gridContainerRef,
  allColumData,
  setIsPageChanging,
  setCommonSearch,
  setFiltersShow,
  setFilters,
  setDraftFilters,
  setFilteredValue,
  showReportMaster,
  onSearchFilter,
  saveReportActivity,
  commonSearch,
  setActiveActionColumn,
  setTempValue,
  colorMaster,
  setSelectedColors,
  selectedColors,
  setSelectedCurrency,
  selectedCurrency,
  currencyMaster,
  filteredRows,
  sortModel,
  columns,
  setShowPrintView,
  setPrintData,
  grupEnChekBoxImage,
  showImageView,
  setShowImageView,
  reportName,
  isExpanded,
  setIsExpanded,
  apiRef,
  setChartView,
  chartView,
  columnsHide,
  draftFilters,
  setFiltersShowDraf,
  filteredValueState,
  originalRows,
  selectedGroups,
  setSuggestionVisibility,
  suggestionVisibility,
  highlightedIndex,
  setHighlightedIndex,
  filtersShowDraf,
  setOtherReprot,
  otherReport,
  setAllColumData,
  allColumDataBack,
  setAllColumDataBack,
  setCurrentOpenReport,
  currentOpenReport
}) => {
  const [searchParams] = useSearchParams();
  const pid = searchParams.get("pid");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clearDateFilter, setClearDateFilter] = useState({
    startDate: "",
    endDate: "",
    status: "",
  });
  const [applyAfterChange, setApplyAfterChange] = useState(false);
  const serverFiltersRef = useRef({});
  const [openSaveModal, setOpenSaveModal] = useState(false);
  const clientIpAddress = sessionStorage.getItem("clientIpAddress");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessageColor, setErrorMessageColor] = useState("error");

  useEffect(() => {
    if (window.self !== window.top) {
      console.warn("Page is embedded in iframe - fullscreen may be restricted");
    }
  }, []);

  const handleAllDataShow = () => {
    setIsPageChanging(true);
    setTimeout(() => {
      setIsPageChanging(false);
    }, 400);
    const cleared = { startDate: "", endDate: "", status: "" };
    setClearDateFilter(cleared);
    setFilterState((prev) => ({
      ...prev,
      dateRange: { startDate: "", endDate: "" },
    }));

    const pickerInput = document.querySelector(
      'input[aria-label="Date Range"]'
    );
    if (pickerInput) pickerInput.value = "";
    setCommonSearch("");
    if (masterKeyData?.MultiDateFilter == "True") {
      setSelectedDateColumn();
    }
    setFilteredValue({});
    setFiltersShowDraf({});
    setFiltersShow({});
    setFilters({});
    setDraftFilters({});
    const keyPrefix = `${pid}_`;
    const matchingKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith(keyPrefix)
    );
    if (matchingKey) {
      const reportId = matchingKey.split("_")[1];
      saveReportActivity(reportId, {
        ActionName: "FILTER",
        ActionOn: "AllDatabutton",
        ActionValue: "",
      });
    }
  };

  const handleColorClick = (id) => {
    setSelectedColors((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  };

  const getSortedRows = () => {
    return [...filteredRows]?.sort((a, b) => {
      const activeSort = sortModel?.[0];
      if (activeSort) {
        const field = activeSort.field;
        const order = activeSort.sort === "asc" ? 1 : -1;
        const x = a[field];
        const y = b[field];

        if (!isNaN(x) && !isNaN(y)) {
          return (Number(x) - Number(y)) * order;
        }
        return String(x).localeCompare(String(y)) * order;
      }

      const col = columns.find(
        (c) => c.DefaultSort && c.DefaultSort !== "None"
      );

      if (!col) return 0;

      const field = col.field;
      const order = col.DefaultSort.toLowerCase() === "ascending" ? 1 : -1;
      const x = a[field];
      const y = b[field];

      if (!isNaN(x) && !isNaN(y)) {
        return (Number(x) - Number(y)) * order;
      }

      return String(x).localeCompare(String(y)) * order;
    });
  };

  const handleOpenPrintPreview = async () => {
    const sorted = getSortedRows();
    setShowPrintView(true);
    setPrintData(sorted);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  const getActionOnFromField = (field) => {
    const column = apiRef.current?.getColumn(field);
    return column?.headerName || field;
  };

  const buildFilterActivityDetails = (currentFilters) => {
    const activities = [];
    Object.entries(currentFilters || {}).forEach(([field, value]) => {
      if (value === "" || value === null || value === undefined) return;

      const actionOn = getActionOnFromField(field);

      if (Array.isArray(value)) {
        value.forEach((v) => {
          activities.push({
            ActionName: "FILTER",
            ActionOn: actionOn,
            ActionValue: String(v),
          });
        });
      } else {
        activities.push({
          ActionName: "FILTER",
          ActionOn: actionOn, // ✅ headerName
          ActionValue: String(value),
        });
      }
    });

    Object.entries(serverFiltersRef.current || {}).forEach(([field, value]) => {
      activities.push({
        ActionName: "FILTER",
        ActionOn: getActionOnFromField(field), // ✅ headerName
        ActionValue: String(value),
      });
    });

    if (commonSearch?.trim()) {
      activities.push({
        ActionName: "SEARCH",
        ActionOn: "Common Search",
        ActionValue: commonSearch.trim(),
      });
    }
    return activities;
  };

  const handleApplyFilter = () => {
    const keyPrefix = `${pid}_`;
    const matchingKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith(keyPrefix)
    );
    if (!matchingKey) {
      console.warn("No ReportId found in sessionStorage for pid", pid);
      return;
    }
    const reportId = matchingKey.split("_")[1];
    setFilters(draftFilters);
    setFiltersShow(filtersShowDraf);
    const filterActivities = buildFilterActivityDetails(draftFilters);
    if (filterActivities.length > 0) {
      saveReportActivity(reportId, filterActivities);
    }
  };

  useEffect(() => {
    if (!applyAfterChange) return;

    handleApplyFilter();
    setApplyAfterChange(false);
  }, [draftFilters, applyAfterChange]);

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const key = isMac ? "Cmd + Ctrl + F" : "F11";
      alert(`Fullscreen blocked. Press ${key} for fullscreen mode.`);
    }
  };

  function mapRowsToHeaders(columns = [], rows = []) {
    const safeRows = Array.isArray(rows) ? rows : [];
    const isIsoDateTime = (str) =>
      typeof str === "string" && /^\d{4}-\d{2}-\d{2}T/.test(str);

    const isValidTwoColumn = (val) =>
      val && val !== "Select" && val !== "";

    const columnMap = {};
    columns.forEach((c) => {
      columnMap[c.FieldName || c.field] = c;
    });

    const exportColumns = [];
    const twoColumnFields = new Set(
      columns
        .map((c) => c.TwoColumnData)
        .filter((v) => v && v !== "Select")
    );

    columns.forEach((col) => {
      const field = col.FieldName || col.field;
      const isHidden = col.HideColumn === "True";
      const isVisible = col.IsVisible !== "False";
      const isUsedAsTwoColumn = twoColumnFields.has(field);
      const isImageColumn =
        col.ImageColumn === "True" ||
        field === "ImgUrl" ||
        field === "ImageUrl" ||
        field === "FileName";

      if (isImageColumn) return;
      if (!isVisible) return;
      if (isHidden && !isUsedAsTwoColumn) return;
      exportColumns.push({ ...col, field });
      if (isValidTwoColumn(col.TwoColumnData)) {
        const twoCol = columnMap[col.TwoColumnData];

        if (twoCol) {
          const twoField = twoCol.FieldName || twoCol.field;
          if (
            twoCol.ImageColumn === "True" ||
            twoField === "ImgUrl" ||
            twoField === "ImageUrl" ||
            twoField === "FileName"
          )
            return;

          exportColumns.push({
            ...twoCol,
            field: twoField,
            __fromTwoColumn: true,
          });
        }
      }
    });
    exportColumns.unshift({
      field: "sr",
      HeaderName: "Sr#",
      ColumnType: "Number",
    });


    const fieldToHeader = {};
    const numericFields = [];

    exportColumns.forEach((col) => {
      const field = col.field;
      let header =
        col.HeaderName ||
        col.headerName ||
        col.headerNamesingle ||
        col.FriendlyName ||
        "";

      if (!header && field === "sr") header = "Sr#";

      fieldToHeader[field] = header;

      if (col.ColumnType === "Number") {
        numericFields.push(field);
      }
    });

    const totals = {};
    numericFields.forEach((f) => (totals[f] = 0));

    // 🔹 Map rows
    const mappedRows = safeRows.map((row, idx) => {
      const ordered = {};

      exportColumns.forEach((col) => {
        const field = col.field;
        const header = fieldToHeader[field];

        let value = row[field] ?? "";

        if (field === "sr") value = idx + 1;

        if (isIsoDateTime(value)) {
          const d = new Date(value);
          value = `${String(d.getDate()).padStart(2, "0")}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}-${d.getFullYear()}`;
        }

        if (col.ColumnType === "Number" && !isNaN(value)) {
          totals[field] += Number(value);
        }

        ordered[header] = value;
      });

      return ordered;
    });
    const summaryRow = {};
    exportColumns.forEach((col, index) => {
      const field = col.field;
      const header = fieldToHeader[field];

      if (index === 0) {
        summaryRow[header] = "TOTAL";
      } else if (col.ColumnType === "Number") {
        summaryRow[header] = Number(
          totals[field].toFixed(col.ColumnDecimal ?? 3)
        );
      } else {
        summaryRow[header] = "";
      }
    });

    return [...mappedRows, summaryRow];
  }

  function applyClientSorting(rows = [], sortModel = []) {
    if (!sortModel.length) return rows;

    const [{ field, sort }] = sortModel;

    return [...rows].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sort === "asc" ? -1 : 1;
      if (bVal == null) return sort === "asc" ? 1 : -1;

      // number sort
      if (!isNaN(aVal) && !isNaN(bVal)) {
        return sort === "asc"
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      return sort === "asc"
        ? aVal.toString().localeCompare(bVal.toString())
        : bVal.toString().localeCompare(aVal.toString());
    });
  }

  const sortedRowsForExport = applyClientSorting(filteredRows, sortModel);
  const converted = mapRowsToHeaders(allColumData, sortedRowsForExport);
  const exportToExcel = () => {
    const now = new Date();
    const formattedDate = now
      .toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/[/:]/g, "-");
    const headerRows = [
      [`Report Name : ${reportName}`],
      [`${formattedDate}`],
      [],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(headerRows);
    XLSX.utils.sheet_add_json(worksheet, converted, {
      origin: "A4",
      skipHeader: false,
    });
    const columnWidths = Object.keys(converted[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...converted.map((row) => String(row[key] ?? "").length)
      ),
    }));
    worksheet["!cols"] = columnWidths;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: EXCEL_TYPE });
    const fileName = `${reportName}_${formattedDate}.xlsx`;
    saveAs(data, fileName);
  };

  const SERVER_SEP = "###";
  const currentReportFiltersRef = useRef({ FilterHeader: "", FilterValue: "" });
  const buildFilterStrings = () => {
    const { FilterHeader = "", FilterValue = "" } =
      currentReportFiltersRef.current;

    const serverKeys = Object.keys(serverFiltersRef.current || {});
    const serverVals = serverKeys.map((k) => serverFiltersRef.current[k] || "");

    return {
      FilterHeader,
      FilterValue,
      ServerFilterHeader: serverKeys.length
        ? serverKeys.join(SERVER_SEP) + SERVER_SEP
        : "",
      ServerFilterValue: serverVals.length
        ? serverVals.join(SERVER_SEP) + SERVER_SEP
        : "",
    };
  };

  const [tempInput, setTempInput] = useState({});
  const renderServerSideFilter = (col) => {
    if (!col.filterTypes || col.filterTypes.length === 0) return null;

    return col.filterTypes.map((filterType) => {
      if (filterType !== "ServerSideFilter") return null;
      const filterItem = filteredValueState?.find(
        (f) => f.name === col.headerNamesingle
      );
      const handleChange = (e) => {
        const newValue = e.target.value;
        setTempInput((prev) => ({
          ...prev,
          [col.headerNamesingle]: newValue,
        }));
      };

      const handleEnter = (e) => {
        if (e.key !== "Enter") return;
        const enteredValue = tempInput[col.headerNamesingle]?.trim();
        if (!enteredValue) return;
        setFilteredValue((prev = []) => {
          const exists = prev.find((f) => f.name === col.headerNamesingle);
          return exists
            ? prev.map((f) =>
              f.name === col.headerNamesingle
                ? { ...f, value: enteredValue }
                : f
            )
            : [...prev, { name: col.headerNamesingle, value: enteredValue }];
        });

        serverFiltersRef.current = {
          ...serverFiltersRef.current,
          [col.FieldName]: enteredValue,
        };

        const parts = buildFilterStrings();
        const mergedPayload = {
          ...(parts.FilterHeader && { FilterHeader: parts.FilterHeader }),
          ...(parts.FilterValue && { FilterValue: parts.FilterValue }),
          ...(parts.ServerFilterHeader && {
            ServerFilterHeader: parts.ServerFilterHeader,
          }),
          ...(parts.ServerFilterValue && {
            ServerFilterValue: parts.ServerFilterValue,
          }),
        };
        toggleDrawer(false);
        onSearchFilter?.([mergedPayload], "-1");
      };

      const handleClear = () => {
        setTempInput((prev) => {
          const copy = { ...prev };
          delete copy[col.headerNamesingle];
          return copy;
        });

        setFilteredValue((prev) =>
          prev.filter((f) => f.name !== col.headerNamesingle)
        );

        const copy = { ...serverFiltersRef.current };
        delete copy[col.FieldName];
        serverFiltersRef.current = copy;

        const parts = buildFilterStrings();
        const mergedPayload = {
          ...(parts.FilterHeader && { FilterHeader: parts.FilterHeader }),
          ...(parts.FilterValue && { FilterValue: parts.FilterValue }),
          ...(parts.ServerFilterHeader && {
            ServerFilterHeader: parts.ServerFilterHeader,
          }),
          ...(parts.ServerFilterValue && {
            ServerFilterValue: parts.ServerFilterValue,
          }),
        };

        onSearchFilter?.([mergedPayload], "0");
      };

      return (
        <div
          style={{ width: "100%", margin: "0px" }}
          key={col.headerNamesingle}
        >
          <TextField
            label={`Search ${col.headerNamesingle}`}
            variant="outlined"
            style={{ width: "100%" }}
            className="customize_colum_input"
            InputProps={{
              style: { height: 40, fontSize: 16, width: "100%" },
              endAdornment: tempInput[col.headerNamesingle] ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClear}>
                    <X size={16} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              "& .MuiInputLabel-root": {
                top: "-8px",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                top: "0px",
              },
              "& .MuiInputLabel-root.MuiInputLabel-shrink": {
                top: "0px",
              },
            }}
            value={tempInput[col.headerNamesingle] || ""}
            onChange={handleChange}
            onKeyDown={handleEnter}
          />
        </div>
      );
    });
  };
  const [openFilter, setOpenFilter] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".filter-accordion-wrapper")) {
        setOpenFilter(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderFilterMulti = (col) => {
    if (!col.filterTypes || col.filterTypes.length === 0) return null;
    const filtersToRender = col.filterTypes;

    return filtersToRender?.map((filterType) => {
      switch (filterType) {
        case "MultiSelection":
          const uniqueValues = [
            ...new Set(originalRows?.map((row) => row[col.field])),
          ];
          return (
            <div
              key={col.field}
              className="filter-accordion-wrapper"
              style={{ position: "relative", display: "inline-block" }}
            >

              <Accordion
                elevation={0}
                disableGutters
                expanded={openFilter === col.field}
                sx={{
                  width: 200,
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  position: "relative",
                  "&::before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<MdExpandMore />}
                  onClick={(e) => {
                    e.stopPropagation(); // prevents outside handler
                    setOpenFilter((prev) =>
                      prev === col.field ? null : col.field
                    );
                  }}
                  sx={{
                    height: 40,
                    minHeight: "40px !important",
                    padding: "0 12px",
                    cursor: "pointer",
                    "& .MuiAccordionSummary-content": {
                      margin: 0,
                      alignItems: "center",
                    },
                  }}
                >
                  <p style={{ margin: 0, fontSize: 14 }}>
                    {col.headerNameSub}
                  </p>
                </AccordionSummary>

                <AccordionDetails
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="gridMetalComboMain"
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderTop: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 1300,
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "#fff",
                      display: "flex",
                      justifyContent: "flex-end",
                      padding: "6px 8px",
                      borderBottom: "1px solid #eee",
                      flexDirection: 'column'
                    }}
                  >
                    <Button size="small" variant="outlined" onClick={handleApplyFilter}
                      style={{
                        borderColor: 'rgb(115, 103, 240)',
                        color: 'rgb(115, 103, 240)'
                      }}>
                      Search
                    </Button>
                    <div
                      style={{
                        maxHeight: 220,
                        overflowY: "auto",
                        padding: "6px 10px",
                      }}
                    >
                      {uniqueValues.map((value) => (
                        <label
                          key={value}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 0",
                            fontSize: "13px"
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={(draftFilters[col.field] || []).includes(value)}
                            onChange={(e) => {
                              const checked = e.target.checked;

                              setDraftFilters((prev) => {
                                const existing = prev[col.field] || [];
                                return {
                                  ...prev,
                                  [col.field]: checked
                                    ? [...existing, value]
                                    : existing.filter((v) => v !== value),
                                };
                              });

                              setFiltersShowDraf((prev) => {
                                const key = col.headerNamesingle;
                                const existing = prev[key] || [];
                                return {
                                  ...prev,
                                  [key]: checked
                                    ? [...new Set([...existing, value])]
                                    : existing.filter((v) => v !== value),
                                };
                              });
                            }}
                          />
                          {value}
                        </label>
                      ))}
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
            </div>
          );
        default:
          return null;
      }
    });
  };


  const renderFilterRange = (col) => {
    if (!col.filterTypes || col.filterTypes.length === 0) return null;
    const filtersToRender = col.filterTypes;
    return filtersToRender.map((filterType) => {
      switch (filterType) {
        case "RangeFilter":
          return (
            <div
              key={`filter-${col.FieldName}-RangeFilter`}
              style={{ margin: "0px", display: "flex", gap: "10px" }}
            >
              <TextField
                type="number"
                key={`filter-${col.headerNamesingle}-MinFilter`}
                name={`filter-${col.headerNamesingle}-MinFilter`}
                label={`${col.headerNamesingle} Min`}
                variant="outlined"
                value={draftFilters[`${col.FieldName}_min`] || ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? parseFloat(e.target.value)
                    : "";
                  setDraftFilters((prev) => ({
                    ...prev,
                    [`${col.FieldName}_min`]: value,
                  }));

                  setFiltersShowDraf((prev) => ({
                    ...prev,
                    [`${col.headerNamesingle}_min`]: value,
                  }));
                }}
                style={{ width: "50%" }}
                InputLabelProps={{
                  style: {
                    fontFamily: "Poppins, sans-serif",
                  },
                }}
                InputProps={{
                  style: {
                    height: 40,
                    fontSize: 16,
                  },
                }}
                sx={{
                  "& .MuiInputLabel-root": {
                    top: "-5px",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    top: "0px",
                  },
                  "& .MuiInputLabel-root.MuiInputLabel-shrink": {
                    top: "0px",
                  },
                }}
              />

              <TextField
                type="number"
                key={`filter-${col.headerNamesingle}-MaxFilter`}
                name={`filter-${col.headerNamesingle}-MaxFilter`}
                label={`${col.headerNamesingle} Max`}
                variant="outlined"
                value={draftFilters[`${col.FieldName}_max`] || ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? parseFloat(e.target.value)
                    : "";
                  setDraftFilters((prev) => ({
                    ...prev,
                    [`${col.FieldName}_max`]: value,
                  }));

                  setFiltersShowDraf((prev) => ({
                    ...prev,
                    [`${col.headerNamesingle}_max`]: value,
                  }));
                }}
                style={{ width: "50%" }}
                InputLabelProps={{
                  style: {
                    fontFamily: "Poppins, sans-serif",
                  },
                }}
                InputProps={{
                  style: {
                    height: 40,
                    fontSize: 16,
                  },
                }}
                sx={{
                  "& .MuiInputLabel-root": {
                    top: "-5px",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    top: "0px",
                  },
                  "& .MuiInputLabel-root.MuiInputLabel-shrink": {
                    top: "0px",
                  },
                }}
              />
            </div>
          );
        default:
          return null;
      }
    });
  };

  const renderFilterDropDown = (col) => {
    const field = col.field;
    if (masterKeyData?.GroupCheckBox === "True") {
      if (col?.GrupChekBox == "True") {
        if (!selectedGroups[field]) return null;
      }
    }
    if (!col.filterTypes || col.filterTypes.length === 0) return null;
    const filtersToRender = col.filterTypes;

    return filtersToRender.map((filterType) => {
      switch (filterType) {
        case "selectDropdownFilter": {
          let uniqueValues = [
            ...new Set(originalRows?.map((row) => row[col.field])),
          ];
          uniqueValues = uniqueValues.filter((v) => v && v.trim() !== "");
          uniqueValues.sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base" })
          );
          return (
            <div
              key={`filter-${col.field}-selectDropdownFilter`}
              style={{ width: "100%", margin: "0px" }}
            >
              <FormControl fullWidth size="small" style={{ width: '200px' }}>
                <InputLabel id="demo-simple-select-label">{`Select ${col.headerNameSub}`}</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label={`Select ${col.headerNameSub}`}
                  name={`Select ${col.headerNameSub}`}
                  value={draftFilters[col.field] || ""}
                  onChange={(e) => {
                    setDraftFilters((prev) => ({
                      ...prev,
                      [col.field]: e.target.value,
                    }));
                    setFiltersShowDraf((prev) => ({
                      ...prev,
                      [`${col.headerNamesingle}`]: e.target.value,
                    }))

                    setApplyAfterChange(true); // 🔥 trigger apply
                  }}
                  style={{
                    height: 40,
                    fontSize: 14,
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  <MenuItem value="" style={{ fontSize: '14px' }}>
                    <em>{`Select ${col?.headerNameSub}`}</em>
                  </MenuItem>
                  {uniqueValues.map((value) => (
                    <MenuItem
                      key={`select-${col.field}-${value}`}
                      value={value}
                      style={{ fontSize: "13px" }}
                    >
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          );
        }
        default:
          return null;
      }
    });
  };

  const renderFilter = (col) => {
    if (col.IsOnScreenFilter == "True") {
      if (!col.filterTypes || col.filterTypes.length === 0) return null;
      const filtersToRender = col.filterTypes;
      return filtersToRender.map((filterType) => {
        switch (filterType) {
          case "NormalFilter":
            return (
              <div style={{ width: "100%", margin: "0px" }}>
                <TextField
                  key={`filter-${col.headerNamesingle}-NormalFilter`}
                  name={`filter-${col.headerNamesingle}-NormalFilter`}
                  label={`Search ${col.headerNamesingle}`}
                  variant="outlined"
                  value={draftFilters[col.FieldName] || ""}
                  style={{ width: "100%" }}
                  onChange={(e) => {
                    const value = e.target.value.replace(/^\s+/, ""); // remove leading spaces
                    setDraftFilters((prev) => ({
                      ...prev,
                      [col.FieldName]: value,
                    }));

                    setFiltersShowDraf((prev) => ({
                      ...prev,
                      [col.headerNamesingle]: value,
                    }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      setDraftFilters((prev) => ({
                        ...prev,
                        [col.FieldName]: value,
                      }));
                      setFiltersShowDraf((prev) => ({
                        ...prev,
                        [col.headerNamesingle]: value,
                      }));
                      setApplyAfterChange(true);
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.trim(); // final trim

                    setDraftFilters((prev) => ({
                      ...prev,
                      [col.FieldName]: value,
                    }));

                    setFiltersShowDraf((prev) => ({
                      ...prev,
                      [col.headerNamesingle]: value,
                    }));
                  }}
                  className="customize_colum_input"
                  InputLabelProps={{
                    style: { fontFamily: "Poppins, sans-serif" },
                  }}
                  InputProps={{
                    style: { height: 40, fontSize: 16 },
                  }}
                  sx={{
                    "& .MuiInputLabel-root": { top: "-5px" },
                    "& .MuiInputLabel-root.Mui-focused": { top: "0px" },
                    "& .MuiInputLabel-root.MuiInputLabel-shrink": { top: "0px" },
                  }}
                />
              </div>
            );
          default:
            return null;
        }
      });
    }
  };

  const suggestionRefs = useRef({});
  const suggestionItemRefs = useRef({});
  const getSafeDropdownStyle = (ref) => {
    if (!ref) {
      return { openUpward: false, maxHeight: 200 };
    }
    const rect = ref.getBoundingClientRect();
    const SAFE_GAP = 8;
    const TASKBAR_BUFFER = 48; // important for Windows taskbar
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom - SAFE_GAP - TASKBAR_BUFFER;
    const spaceAbove = rect.top - SAFE_GAP;
    const openUpward = spaceBelow < 160 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      120,
      Math.min(280, openUpward ? spaceAbove : spaceBelow)
    );

    return { openUpward, maxHeight };
  };

  useEffect(() => {
    function handleClickOutside(event) {
      for (const field in suggestionRefs.current) {
        if (
          suggestionRefs.current[field] &&
          !suggestionRefs.current[field].contains(event.target)
        ) {
          setSuggestionVisibility((prev) => ({
            ...prev,
            [field]: false,
          }));
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    Object.keys(suggestionVisibility).forEach((field) => {
      if (suggestionVisibility[field] && suggestionRefs.current[field]) {
        suggestionRefs.current[field].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    });
  }, [suggestionVisibility]);

  useEffect(() => {
    Object.keys(highlightedIndex).forEach((field) => {
      const index = highlightedIndex[field];
      const el = suggestionItemRefs.current[field]?.[index];

      if (el) {
        el.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    });
  }, [highlightedIndex]);

  useEffect(() => {
    const getReport = async () => {
      let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
      const keyPrefix = `${pid}_`;
      const matchingKey = Object.keys(sessionStorage).find((key) =>
        key.startsWith(keyPrefix)
      );
      if (!matchingKey) {
        console.warn("No ReportId found in sessionStorage for pid", pid);
        return;
      }
      const reportId = matchingKey.split("_")[1];

      const body = {
        con: JSON.stringify({
          mode: "getSubReportData",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify({
          ReportId: reportId,
        }),
        f: "DynamicReport ( getSubReportData )",
      };
      const response = await CallApi(body);
      if (response) {
        setOtherReprot(response?.rd);
      }
    }

    getReport();
  }, [])

  const renderSuggestionFilter = (col) => {
    const field = col.field;
    if (masterKeyData?.GroupCheckBox === "True") {
      if (col?.GrupChekBox == "True") {
        if (!selectedGroups[field]) return null;
      }
    }
    if (!col.filterTypes || col.filterTypes.length === 0) return null;

    return col.filterTypes.map((filterType) => {
      if (filterType !== "suggestionFilter") return null;

      const field = col.field;
      const headerName = col.headerNameSub;

      if (!suggestionItemRefs.current[field]) {
        suggestionItemRefs.current[field] = [];
      }

      const inputValue = draftFilters[field]?.toString().toLowerCase() || "";
      const suggestions =
        inputValue.length > 0
          ? [
            ...new Set(
              originalRows
                .map((row) => row[field])
                .filter(
                  (val) =>
                    val && val.toString().toLowerCase().includes(inputValue)
                )
            ),
          ]
          : [];

      const handleInputChange = (value) => {
        setDraftFilters((prev) => ({
          ...prev,
          [field]: value,
        }));

        setFiltersShowDraf((prev) => ({
          ...prev,
          [`${col.headerNamesingle}`]: value,
        }))
        setSuggestionVisibility((prev) => ({ ...prev, [field]: true }));
        setHighlightedIndex((prev) => ({ ...prev, [field]: 0 }));
      };

      const handleSelectSuggestion = (value) => {
        setDraftFilters((prev) => ({
          ...prev,
          [field]: value,
        }));
        setFiltersShowDraf((prev) => ({
          ...prev,
          [`${col.headerNamesingle}`]: value,
        }))
        setSuggestionVisibility((prev) => ({ ...prev, [field]: false }));
        setHighlightedIndex((prev) => ({ ...prev, [field]: 0 }));

        setApplyAfterChange(true);
      };

      const handleKeyDown = (e) => {
        if (!suggestionVisibility[field] || suggestions.length === 0) return;

        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedIndex((prev) => ({
            ...prev,
            [field]: Math.min((prev[field] ?? 0) + 1, suggestions.length - 1),
          }));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedIndex((prev) => ({
            ...prev,
            [field]: Math.max((prev[field] ?? 0) - 1, 0),
          }));
        } else if (e.key === "Enter") {
          e.preventDefault();
          const current = suggestions[highlightedIndex[field] ?? 0];
          if (current) handleSelectSuggestion(current);
        }
      };

      const refCallback = (node) => {
        if (node) {
          suggestionRefs.current[field] = node;
        }
      };

      const { openUpward, maxHeight } = getSafeDropdownStyle(
        suggestionRefs.current[field]
      );

      return (
        <div
          key={`filter-${field}-suggestionFilter`}
          ref={refCallback}
          style={{ margin: "0px", position: "relative", width: "100%" }}
        >
          <TextField
            label={`Search ${headerName}`}
            variant="outlined"
            value={draftFilters[field] || ""}
            style={{ width: "100%" }}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if ((draftFilters[field] || "").trim().length > 0) {
                setSuggestionVisibility((prev) => ({ ...prev, [field]: true }));
              }
            }}
            onKeyDown={handleKeyDown}
            size="small"
            autoComplete="off"
            InputLabelProps={{ style: { fontFamily: "Poppins, sans-serif" } }}
            InputProps={{ style: { height: 40, fontSize: 16 } }}
          />

          {suggestionVisibility[field] && suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                width: "100%",
                maxHeight: `${maxHeight}px`,
                overflowY: "auto",
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.15)",
                zIndex: 2000,
                top: openUpward ? "auto" : "100%",
                bottom: openUpward ? "100%" : "auto",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {suggestions.map((value, index) => (
                <div
                  key={`suggestion-${field}-${value}`}
                  ref={(el) => {
                    suggestionItemRefs.current[field][index] = el;
                  }}
                  onClick={() => handleSelectSuggestion(value)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                    fontSize: "0.8125rem",
                    background:
                      index === highlightedIndex[field]
                        ? "#eee"
                        : "transparent",
                  }}
                >
                  {value}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };



  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "5px 10px",
      }}
    >
      <div style={{ width: '100%' }}>
        {masterKeyData?.MakeNewReport == "True" &&
          <MakeNewReport
            setAllColumData={setAllColumData}
            allColumDataBack={allColumDataBack}
            allColumData={allColumData}
            otherReport={otherReport}
            setOtherReprot={setOtherReprot}
            setAllColumDataBack={setAllColumDataBack}
            setOpenSnackbar={setOpenSnackbar}
            setErrorMessageColor={setErrorMessageColor}
            openSaveModal={openSaveModal}
            setOpenSaveModal={setOpenSaveModal}
            currentOpenReport={currentOpenReport}
            setCurrentOpenReport={setCurrentOpenReport}
          />}
        <div style={{ width: '100%', justifyContent: 'space-between', display: 'flex' }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Button onClick={toggleDrawer(true)} className="btn_FiletrBtnOpen">
                <MdOutlineFilterAlt style={{ height: "30px", width: "30px" }} />
              </Button>
              {spliterReportShow != true &&
                (masterKeyData?.MainDateFilter == "True" ||
                  masterKeyData?.AllDataButton == "True")
                &&
                <div style={{
                  display: "flex", gap: '5px',
                  backgroundColor: masterKeyData?.MainDateFilter == "True" && 'rgb(247 243 243)',
                  borderRadius: '10px',
                  padding: masterKeyData?.MainDateFilter == "True" && '10px'
                }}>
                  {
                    masterKeyData?.MainDateFilter == "True" &&
                    <CustomDualDatePicker
                      value={selectedDateColumn}
                      dateColumnOptions={dateColumnOptions}
                      setFilterState={setFilterState}
                      filterState={filterState}
                      dateTypeShow={masterKeyData?.MultiDateFilter}
                      clearDateFilter={clearDateFilter}
                      setSelectedDateColumn={setSelectedDateColumn}
                      selectedDateColumn={selectedDateColumn}
                      showReportMaster={showReportMaster}
                    />
                  }
                  {
                    masterKeyData?.AllDataButton == "True" && (
                      <Button
                        onClick={handleAllDataShow}
                        className="btn_FiletrBtnAll"
                      >
                        All
                      </Button>
                    )
                  }
                </div>
              }

              <TextField
                type="text"
                placeholder="Search..."
                value={commonSearch}
                onChange={(e) => setCommonSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} color="#888" />
                    </InputAdornment>
                  ),
                  endAdornment: commonSearch ? (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => setCommonSearch("")}
                        aria-label="clear"
                      >
                        <X size={18} color="#888" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                sx={{
                  width: "280px",
                  "& .MuiOutlinedInput-root": {
                    height: "40px",
                    paddingRight: "4px",
                  },
                  "& .MuiInputBase-input": {
                    padding: "6px 8px !important",
                  },
                }}
                className="txt_commonSearch"
              />

              {columnsHide
                .filter(col => col.filterable && col.IsOnScreenFilter === "True")
                .map((col) => {
                  if (!col.filterTypes?.includes("ServerSideFilter")) {
                    return null;
                  }
                  return (
                    <div key={col.FieldName}>
                      {renderServerSideFilter(col)}
                    </div>
                  );
                })}

              {columnsHide
                .filter(col => col.filterable && col.IsOnScreenFilter === "True")
                .map((col) => {
                  if (!col.filterTypes?.includes("MultiSelection")) {
                    return null;
                  }
                  return (
                    <div key={col.FieldName} style={{ display: 'flex' }}>
                      {renderFilterMulti(col)}
                    </div>
                  );
                })}

              {columnsHide
                .filter(col => col.filterable && col.IsOnScreenFilter === "True")
                .map((col) => {
                  if (!col.filterTypes?.includes("RangeFilter")) {
                    return null;
                  }
                  return (
                    <div key={col.FieldName}>
                      {renderFilterRange(col)}
                    </div>
                  );
                })}

              {columnsHide
                .filter(col => col.filterable && col.IsOnScreenFilter === "True")
                .map((col) => {
                  if (!col.filterTypes?.includes("selectDropdownFilter")) {
                    return null;
                  }
                  return (
                    <div key={col.FieldName}>
                      {renderFilterDropDown(col)}
                    </div>
                  );
                })}


              {columnsHide
                .filter(col => col.filterable && col.IsOnScreenFilter === "True")
                .map((col) => {
                  if (!col.filterTypes?.includes("NormalFilter")) {
                    return null;
                  }
                  return (
                    <div key={col.FieldName}>
                      {renderFilter(col)}
                    </div>
                  );
                })}

              {columnsHide
                .filter(col => col.filterable && col.IsOnScreenFilter === "True")
                .map((col) => {
                  if (!col.filterTypes?.includes("suggestionFilter")) {
                    return null;
                  }
                  return (
                    <div key={col.FieldName}>
                      {renderSuggestionFilter(col)}
                    </div>
                  );
                })}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {allColumData &&
                Object.values(allColumData).map((col) =>
                  col.ActionFilter == "True" ? (
                    <Button
                      key={col.field}
                      variant="outlined"
                      size="small"
                      className="btn_Action_FiletrBtnOpen"
                      onClick={() => {
                        setActiveActionColumn(col);
                        setTempValue("");
                      }}
                    >
                      <Pencil style={{ height: '18px', width: '18px' }} /> {col.HeaderName}
                    </Button>
                  ) : null
                )}
            </div>
            {masterKeyData?.PriorityMaster == "True" && (
              <div style={{ display: "flex", gap: "12px" }}>
                {!isLoading &&
                  colorMaster?.map((data, index) => {
                    const isSelected = selectedColors.includes(data.id);
                    return (
                      <Tooltip
                        title={data.code}
                        key={index}
                        disablePortal
                        PopperProps={{
                          container: gridContainerRef.current,
                        }}
                      >
                        <div
                          onClick={() => handleColorClick(data.id)}
                          style={{
                            backgroundColor: alpha(data.colorcode, 0.75),

                            height: isSelected ? 28 : 30,
                            width: isSelected ? 28 : 30,
                            borderRadius: 15,

                            cursor: 'pointer',
                            boxShadow: isSelected
                              ? `
                              0 0 0 2px ${alpha('#fff', 0.9)},
                              0 0 0 4px ${alpha(data.colorcode, 0.55)},
                              0 8px 16px ${alpha(data.colorcode, 0.35)}
                            `
                              : `
                              inset 0 0 0 1px ${alpha('#000', 0.12)},
                              0 4px 10px ${alpha('#000', 0.08)}
                            `,
                            transition: 'all 0.25s ease',
                          }}
                        />
                      </Tooltip>

                    );
                  })}
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {masterKeyData?.CurrencyMaster == "True" && (
              <FormControl
                size="small"
                sx={{ width: 150, margin: "0px" }}
                className="dropDownMainClass"
              >
                <Select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  MenuProps={{
                    disablePortal: true,
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        overflowY: "auto",
                      },
                    },
                  }}
                  style={{
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  sx={{
                    "& .MuiSelect-select": {
                      padding: "10px !important",
                    },
                  }}
                  className="dropDownListFont"
                >
                  {currencyMaster?.map((col) => (
                    <MenuItem
                      key={col?.id}
                      value={col?.Currencycode}
                      style={{
                        fontSize: "14px",
                      }}
                      className="dropDownListFont"
                    >
                      {col?.Currencycode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {masterKeyData?.PrintButton == "True" && (
              <Tooltip
                title="Print"
                isablePortal
                PopperProps={{
                  container: gridContainerRef.current,
                }}
              >
                <IconButton
                  onClick={handleOpenPrintPreview}
                  sx={{
                    background: "#e8f5e9",
                    color: "#2e7d32",
                    height: "42px",
                    width: "42px",
                    borderRadius: "6px",
                    transition: "all .2s ease",
                    "&:hover": {
                      backgroundColor: "#c8e6c9",
                      transform: "translateY(-2px)",
                    },
                  }}
                  size="medium"
                >
                  <FaPrint size={22} />
                </IconButton>
              </Tooltip>
            )}

            {masterKeyData?.ImageView === "True" &&
              (grupEnChekBoxImage?.length > 0 ? (
                grupEnChekBoxImage.every(
                  (item) => item.DefaultGrupChekBox === true
                ) ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showImageView ? (
                      <Tooltip
                        title="Report View"
                        isablePortal
                        PopperProps={{
                          container: gridContainerRef.current,
                        }}
                      >
                        <IconButton
                          onClick={() => setShowImageView(false)}
                          sx={{
                            background: "#e3f2fd",
                            color: "#1976d2",
                            height: "42px",
                            width: "42px",
                            borderRadius: "6px",
                            transition: "all .2s ease",
                            "&:hover": {
                              backgroundColor: "#bbdefb",
                              transform: "translateY(-2px)",
                            },
                          }}
                          size="medium"
                        >
                          <LayoutGrid size={22} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip
                        title="Image View"
                        isablePortal
                        PopperProps={{
                          container: gridContainerRef.current,
                        }}
                      >
                        <IconButton
                          onClick={() => setShowImageView(true)}
                          sx={{
                            background: "#e3f2fd",
                            color: "#1976d2",
                            height: "42px",
                            width: "42px",
                            borderRadius: "6px",
                            transition: "all .2s ease",
                            "&:hover": {
                              backgroundColor: "#bbdefb",
                              transform: "translateY(-2px)",
                            },
                          }}
                          size="medium"
                        >
                          <Image size={22} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                ) : null
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showImageView ? (
                    <Tooltip
                      title="Report View"
                      isablePortal
                      PopperProps={{
                        container: gridContainerRef.current,
                      }}
                    >
                      <IconButton
                        onClick={() => setShowImageView(false)}
                        sx={{
                          background: "#e3f2fd",
                          color: "#1976d2",
                          height: "42px",
                          width: "42px",
                          borderRadius: "6px",
                          transition: "all .2s ease",
                          "&:hover": {
                            backgroundColor: "#bbdefb",
                            transform: "translateY(-2px)",
                          },
                        }}
                        size="medium"
                      >
                        <LayoutGrid size={22} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip
                      title="Image View"
                      isablePortal
                      PopperProps={{
                        container: gridContainerRef.current,
                      }}
                    >
                      <IconButton
                        onClick={() => setShowImageView(true)}
                        sx={{
                          background: "#e3f2fd",
                          color: "#1976d2",
                          height: "42px",
                          width: "42px",
                          borderRadius: "6px",
                          transition: "all .2s ease",
                          "&:hover": {
                            backgroundColor: "#bbdefb",
                            transform: "translateY(-2px)",
                          },
                        }}
                        size="medium"
                      >
                        <Image size={22} />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
              ))}

            {masterKeyData?.ExcelExport == "True" && (
              <Tooltip
                title="Export to Excel"
                disablePortal
                PopperProps={{
                  container: gridContainerRef.current,
                }}
              >
                <IconButton
                  onClick={exportToExcel}
                  sx={{
                    background: "#e8f5e9",
                    color: "#2e7d32",
                    height: "42px",
                    width: "42px",
                    borderRadius: "6px",
                    transition: "all .2s ease",
                    "&:hover": {
                      backgroundColor: "#c8e6c9",
                      transform: "translateY(-2px)",
                    },
                  }}
                  size="medium"
                >
                  <FileSpreadsheet size={22} />
                </IconButton>
              </Tooltip>
            )}


            {pid == 18418 &&
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {chartView ? (
                  <Tooltip
                    title="Report View"
                    isablePortal
                    PopperProps={{
                      container: gridContainerRef.current,
                    }}
                  >
                    <IconButton
                      onClick={() => setChartView(false)}
                      sx={{
                        background: "#e3f2fd",
                        color: "#1976d2",
                        height: "42px",
                        width: "42px",
                        borderRadius: "6px",
                        transition: "all .2s ease",
                        "&:hover": {
                          backgroundColor: "#bbdefb",
                          transform: "translateY(-2px)",
                        },
                      }}
                      size="medium"
                    >
                      <LayoutGrid size={22} />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip
                    title="Chart View"
                    isablePortal
                    PopperProps={{
                      container: gridContainerRef.current,
                    }}
                  >
                    <IconButton
                      onClick={() => setChartView(true)}
                      sx={{
                        background: "#e3f2fd",
                        color: "#1976d2",
                        height: "42px",
                        width: "42px",
                        borderRadius: "6px",
                        transition: "all .2s ease",
                        "&:hover": {
                          backgroundColor: "#bbdefb",
                          transform: "translateY(-2px)",
                        },
                      }}
                      size="medium"
                    >
                      <ChartNoAxesCombined size={22} />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            }

            {masterKeyData?.MakeNewReport == "True" &&
              <Button onClick={() => setOpenSaveModal(true)}
                style={{
                  width: '180px',
                  backgroundColor: '#4439f7',
                  color: 'white'
                }}>
                Make New report
              </Button>
            }

            {/* {masterKeyData?.FullScreenGridButton == "True" && (
          <Tooltip
            title={isFullscreen ? "Exit Full Screen" : "Full Screen Report"}
            isablePortal
            PopperProps={{
              container: gridContainerRef.current,
            }}
          >
            <IconButton
              onClick={toggleFullScreen}
              sx={{
                background: "#e8f5e9",
                color: "#2e7d32",
                height: "42px",
                width: "42px",
                borderRadius: "6px",
                transition: "all .2s ease",
                "&:hover": {
                  backgroundColor: "#c8e6c9",
                  transform: "translateY(-2px)",
                },
              }}
              size="medium"
            >
              <RiFullscreenLine size={22} />
            </IconButton>
          </Tooltip>
        )} */}
          </div>
        </div>
      </div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={errorMessageColor} onClose={() => setOpenSnackbar(false)}>
          Save Report Successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ReportTopFilterEndAction;