import React, { useState, useEffect, useRef, useMemo } from "react";
import Box from "@mui/material/Box";
import "./MainReport.scss";
import noFoundImg from "../../../images/noFound.jpg";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "react-datepicker/dist/react-datepicker.css";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  Drawer,
  IconButton,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { AiFillSetting } from "react-icons/ai";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  X,
  NotebookPen,
  Printer,
  MessageCircle,
} from "lucide-react";
import { GoCopy } from "react-icons/go";
import Warper from "../../warper";
import { CallApi } from "../../../../API/CallApi/CallApi";
import Print1JewelleryBook from "./Print1JewelleryBook";
import FilterDrawer from "../FilterDrawer/FilterDrawer";
import {
  CustomPagination,
  DraggableColumn,
  formatToMMDDYYYY,
} from "../../../../Utils/globalFunc";
import ImageView from "../ImageView/ImageView";
import ReportTopFilterEndAction from "../ReportTopFilterEndAction/ReportTopFilterEndAction";
import ActionFilter from "../ActionFilter/ActionFilter";

export default function MainReport({
  OtherKeyData,
  masterData,
  onBack,
  showBackErrow,
  filteredValue,
  spNumber,
  onSearchFilter,
  serverSideData,
  isLoadingChek,
  reportName,
  spliterReportShow,
  colorMaster,
  currencyMaster,
}) {
  const [isLoading, setIsLoading] = useState(isLoadingChek);
  const [showImageView, setShowImageView] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [columSaveLoding, setColumSaveLoding] = useState(false);
  const [openHrefModel, setOpenHrefModel] = useState(false);
  const [columns, setColumns] = useState([]);
  const [columnsHide, setColumnsHide] = useState([]);
  const [allColumData, setAllColumData] = useState();
  const [masterKeyData, setMasterKeyData] = useState();
  const [allColumIdWiseName, setAllColumIdWiseName] = useState();
  const [allRowData, setAllRowData] = useState();
  const [checkedColumns, setCheckedColumns] = useState({});
  const [status500, setStatus500] = useState(false);
  const [commonSearch, setCommonSearch] = useState("");
  const [sortModel, setSortModel] = useState([]);
  const [activeActionColumn, setActiveActionColumn] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [dateColumnOptions, setDateColumnOptions] = useState([]);
  const [selectedDateColumn, setSelectedDateColumn] = useState("");
  const [filteredValueState, setFilteredValue] = useState();
  const [grupEnChekBox, setGrupEnChekBox] = useState({});
  const [grupEnChekBoxImage, setGrupEnChekBoxImage] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showReportMaster, setShowReportMaster] = useState(showBackErrow);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [printData, setPrintData] = useState([]);
  const [navigationData, setNavigationData] = useState();
  const [iframeModelData, setIframeModelData] = useState();
  const [sideFilterOpen, setSideFilterOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [iframeUrl, setIframeUrl] = useState("");
  const [navigationPageMaster, setNavigationPageMaster] = useState();
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [draftFilters, setDraftFilters] = useState({});
  const clientIpAddress = sessionStorage.getItem("clientIpAddress");
  const [suggestionVisibility, setSuggestionVisibility] = useState({});
  const [highlightedIndex, setHighlightedIndex] = useState({});
  const [preparingPrint, setPreparingPrint] = useState(false);
  const [currentPrintPage, setCurrentPrintPage] = useState(1);
  const [searchParams] = useSearchParams();
  const gridContainerRef = useRef(null);
  const fullscreenContainer = gridContainerRef.current || document.body;
  const apiRef = useGridApiRef();
  const printRef = useRef();
  const gridRef = useRef(null);
  const defaultSortApplied = useRef(false);
  const initialSort = useRef(null);
  const pid = searchParams.get("pid");
  const firstTimeLoadedRef = useRef(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const [filterState, setFilterState] = useState({
    dateRange: { startDate: null, endDate: null },
  });
  const startDate = filterState?.dateRange?.startDate;
  const endDate = filterState?.dateRange?.endDate;

  const toggleDrawer = (newOpen) => () => {
    setSideFilterOpen(newOpen);
  };

  useEffect(() => {
    const keyPrefix = `${pid}_`;
    const matchingKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith(keyPrefix)
    );
    if (!matchingKey) {
      console.warn("No ReportId found in sessionStorage for pid", pid);
      return;
    }
    const reportId = matchingKey.split("_")[1];
    const getIframeUrlParams = async () => {
      try {
        let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
        const body = {
          con: JSON.stringify({
            mode: "getIframeUrlParams",
            appuserid: AllData?.LUId,
            IPAddress: clientIpAddress,
          }),
          p: JSON.stringify({
            ReportId: reportId,
          }),
          f: "get iframe list (get url data)",
        };
        const response = await CallApi(body);
        setIframeModelData(response);
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    };

    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
    const getNavigationPageName = async () => {
      const body = {
        con: JSON.stringify({
          mode: "getRedirectMaster",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify({ ReportId: reportId }),
        f: "DynamicReport (get Largedata data)",
      };
      try {
        const response = await CallApi(body);
        if (response) {
          setNavigationPageMaster(response);
        }
      } catch (err) {
        console.error("Failed fetching report settings", err);
      }
    };
    getIframeUrlParams();
    getNavigationPageName();
  }, []);

  const saveReportActivity = (reportId, activity) => {
    const key = `reportActivity_${reportId}`;

    const existing = JSON.parse(sessionStorage.getItem(key)) || {
      ReportId: reportId,
      ReportName: reportName,
      activityDetails: [],
    };

    let newActivities = [];

    if (Array.isArray(activity)) {
      newActivities = activity;
    } else if (activity) {
      newActivities = [activity];
    }

    const updatedActivityDetails = [
      ...existing.activityDetails,
      ...newActivities,
    ];

    sessionStorage.setItem(
      key,
      JSON.stringify({
        ...existing,
        activityDetails: updatedActivityDetails,
      })
    );
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const keyPrefix = `${pid}_`;
      const matchingKey = Object.keys(sessionStorage).find((key) =>
        key.startsWith(keyPrefix)
      );
      if (!matchingKey) {
        console.warn("No ReportId found in sessionStorage for pid", pid);
        return;
      }
      const reportId = matchingKey.split("_")[1];
      let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
      const key = `reportActivity_${reportId}`;
      const data = JSON.parse(sessionStorage.getItem(key));
      if (!data || !data.activityDetails.length) return;
      const body = {
        con: JSON.stringify({
          mode: "SaveUserActivityLog",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify(data),
        f: "DynamicReport ( Save User Activity Log )",
      };

      try {
        await CallApi(body);
        sessionStorage.removeItem(key); // ✅ clear after save
      } catch (err) {
        console.error("Activity log save failed", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setShowReportMaster(showBackErrow);
  }, [showBackErrow]);

  useEffect(() => {
    setIsLoading(isLoadingChek);
  }, [isLoadingChek]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const keyPrefix = `${pid}_`;
        const matchingKey = Object.keys(sessionStorage).find((key) =>
          key.startsWith(keyPrefix)
        );

        if (!matchingKey) {
          console.warn("No ReportId found in sessionStorage for pid", pid);
          return;
        }

        const reportId = matchingKey.split("_")[1];
        let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
        const body = {
          con: JSON.stringify({
            mode: "getUrlParams",
            appuserid: AllData?.LUId,
            IPAddress: clientIpAddress,
          }),
          p: JSON.stringify({
            ReportId: reportId,
          }),
          f: "DynamicReport (get url data)",
        };
        const response = await CallApi(body);
        setNavigationData(response);
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    };

    fetchReportData();
  }, [pid, spNumber]);

  useEffect(() => {
    const now = new Date();
    const formattedDate = formatToMMDDYYYY(now);
    fetchData(formattedDate, formattedDate);
    if (showReportMaster || serverSideData == true) {
      setFilterState({
        dateRange: {
          startDate: new Date("1990-01-01T18:30:00.000Z"),
          endDate: new Date(),
        },
      });
    } else {
      setFilterState({
        dateRange: {
          startDate: now,
          endDate: now,
        },
      });
    }
    setTimeout(() => {
      firstTimeLoadedRef.current = true;
    }, 0);
  }, []);

  useEffect(() => {
    if (!firstTimeLoadedRef.current) return;
    const { startDate: s, endDate: e } = filterState.dateRange;
    if (s && e) {
      const formattedStart = formatToMMDDYYYY(new Date(s));
      const formattedEnd = formatToMMDDYYYY(new Date(e));
      fetchData(formattedStart, formattedEnd);
    }
  }, [filterState.dateRange]);

  useEffect(() => {
    setTimeout(() => {
      const items = document.querySelectorAll(
        ".MuiButtonBase-root.MuiListItem-root.MuiListItem-gutters.MuiListItem-padding.MuiListItem-button"
      );
      items.forEach((item) => {
        const textElement = item.querySelector(".MuiListItemText-root");
        if (textElement) {
          const text = textElement.textContent.trim();
          if (text === "Last Year" || text === "This Year") {
            item.style.display = "none";
          }
        }
      });
    }, 100);
  }, []);

  const fetchData = async () => {
    try {
      if (OtherKeyData == null) {
        return;
      }
      setAllRowData(OtherKeyData?.rd3);
      setAllColumIdWiseName(OtherKeyData?.rd2);
      setMasterKeyData(OtherKeyData?.rd[0]);
      let saved = sessionStorage.getItem("savedColumns_" + reportName);
      let rd1;
      if (saved) {
        rd1 = JSON.parse(saved);
      } else {
        rd1 = OtherKeyData?.rd1 ? [...OtherKeyData.rd1] : [];
      }
      // let rd1 = OtherKeyData?.rd1 ? [...OtherKeyData.rd1] : [];
      rd1.sort((a, b) => (a.DisplayOrder ?? 999) - (b.DisplayOrder ?? 999));
      setAllColumData(rd1);
      const grupCheckboxMap = (rd1 || [])
        .filter((col) => col?.GrupChekBox == "True")
        .reduce((acc, col) => {
          acc[col.FieldName] = col.DefaultGrupChekBox == "True";
          return acc;
        }, {});

      const grupCheckboxArray = (rd1 || [])
        .filter((col) => col?.GroupColumnImageView == "True")
        .map((col) => ({
          FieldName: col.FieldName,
          DefaultGrupChekBox: col.DefaultGrupChekBox == "True",
        }));

      setGrupEnChekBoxImage(grupCheckboxArray);
      setGrupEnChekBox(grupCheckboxMap);
      setStatus500(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setStatus500(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, [OtherKeyData]);

  useEffect(() => {
    if (allColumData?.length > 0) {
      const initialChecked = {};
      allColumData?.forEach((col) => {
        initialChecked[col.FieldName] =
          col.IsVisible === true || col.IsVisible === "True";
      });
      setCheckedColumns(initialChecked);
    }
  }, [allColumData]);

  const handleGrupEnChekBoxChange = (field) => {
    setGrupEnChekBox((prev) => {
      const newValue = !prev[field];

      if (!newValue) {
        setDraftFilters((prevDraft) => {
          const updated = { ...prevDraft };
          delete updated[field];
          return updated;
        });

        setFilters((prevFilters) => {
          const updated = { ...prevFilters };
          delete updated[field];
          return updated;
        });
        setSuggestionVisibility((prev) => ({
          ...prev,
          [field]: false,
        }));
        setHighlightedIndex((prev) => ({
          ...prev,
          [field]: 0,
        }));
      }

      return {
        ...prev,
        [field]: newValue,
      };
    });

    setGrupEnChekBoxImage((prev) =>
      prev.map((item) =>
        item.FieldName === field
          ? { ...item, DefaultGrupChekBox: !item.DefaultGrupChekBox }
          : item
      )
    );
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.altKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setSideFilterOpen(true);
      }

      if (e.altKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setSideFilterOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useEffect(() => {
    if (!allColumData) return;
    const toBool = (val) => String(val).toLowerCase() === "true";
    const columnData = Object?.values(allColumData)
      ?.filter((col) => col.IsVisible == "True")
      ?.map((col, index) => {
        return {
          field: col.FieldName,
          headerName: col.HeaderName, // Just use the text here
          renderHeader: (
            params // Use renderHeader for custom header content
          ) => (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {col?.GrupChekBox == "True" &&
                masterKeyData?.GroupCheckBox == "True" && (
                  <Checkbox
                    checked={grupEnChekBox[col.FieldName] || false}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleGrupEnChekBoxChange(col.FieldName)}
                    size="small"
                    sx={{
                      p: 0,
                      "&.Mui-checked": {
                        color: "rgb(115, 103, 240)",
                      },
                    }}
                  />
                )}
              <span>{col.HeaderName}</span>
            </div>
          ),
          headerNameSub: col.HeaderName,
          headerNamesingle: col.HeaderName,
          FieldName: col.FieldName,
          width: col.Width,
          align: col.ColumnAlign || "left",
          headerAlign: col?.HeaderAlign,
          filterable: col.ColumnFilter,
          suggestionFilter: col.SuggestionFilter,
          hrefLink: col.HrefLink,
          onHrefLinkModel: col.OnHrefLinkModel,
          onHrefNavigate: col.OnHrefNavigate,
          Summary: col?.Summary,
          SummaryValueKey: col.SummaryValueKey,
          DefaultSort: col.DefaultSort,
          SummaryValueFormated: col.SummaryValueFormated,
          DisplayOrder: col.DisplayOrder,
          ColumnType: col.ColumnType,
          flex: col?.Width == null || (col?.Width == 0 && 1),
          SummaryTitle: col.SummaryTitle,
          IsCurrency: col?.IsCurrency,
          IconName: col.IconName,
          SummaryUnit: col.SummaryUnit,
          ColumnDecimal: col.ColumnDecimal,
          HideColumn: col.HideColumn,
          CopyButton: col.CopyButton,
          ColId: col.ColId,
          SummeryOrder: col?.SummeryOrder,
          IsUniqueCount: col?.IsUniqueCount,
          RedirectId: col?.RedirectId,
          IframeTypeId: col.IframeTypeId,
          IsShowDateWithTime: col.IsShowDateWithTime,
          filterTypes: [
            toBool(col.NormalFilter) && "NormalFilter",
            toBool(col.MultiSelection) && "MultiSelection",
            toBool(col.RangeFilter) && "RangeFilter",
            toBool(col.SuggestionFilter) && "suggestionFilter",
            toBool(col.SelectDropdownFilter) && "selectDropdownFilter",
            toBool(col.ServerSideFilter) && "ServerSideFilter",
          ].filter(Boolean),

          renderCell: (params) => {
            const displayValue = params.value;

            if (col.ColumnType === "Date") {
              let formattedDate = "-";
              if (
                params.value &&
                params.value !== "-" &&
                !isNaN(new Date(params.value).getTime())
              ) {
                const dateObj = new Date(params.value);

                if (col.IsShowDateWithTime) {
                  // Date + Time (HH:mm:ss) in UTC
                  const datePart = dateObj.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  });

                  const timePart = dateObj.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                    timeZone: "UTC",
                  });

                  formattedDate = `${datePart} ${timePart}`;
                } else {
                  // Date only
                  formattedDate = dateObj.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  });
                }
              }

              return (
                <span
                  style={{
                    color: col.FontColor || "inherit",
                    backgroundColor: col.BackgroundColor || "inherit",
                    fontSize: col.FontSize || "12px",
                    textTransform: col.ColumTitleCapital ? "uppercase" : "none",
                    padding: "0px",
                    borderRadius: col.BorderRadius,
                  }}
                >
                  {formattedDate}
                </span>
              );
            }

            if (col?.ImageColumn == "True") {
              const src =
                String(params?.row?.ImgUrl ?? "").trim() || noFoundImg;
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <img
                    src={src}
                    onError={(e) => {
                      if (e.target.src !== noFoundImg)
                        e.target.src = noFoundImg;
                    }}
                    style={{
                      height: "35px",
                      width: "35px",
                      borderRadius: "5px",
                    }}
                  />
                </div>
              );
            }

            if (col?.IframeTypeId) {
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Button
                    onClick={() =>
                      openIframe(
                        params,
                        params?.colDef?.ColId,
                        params?.colDef?.IframeTypeId
                      )
                    }
                    style={{
                      padding: "0px",
                      fontSize: "12px",
                      color: "black",
                      textDecoration: "underline",
                    }}
                  >
                    {col?.IconName == "NotebookPen" ? (
                      <NotebookPen style={{ color: "gray" }} />
                    ) : col?.IconName == "Printer" ? (
                      <Printer style={{ color: "gray" }} />
                    ) : col?.IconName == "MessageCircle" ? (
                      <MessageCircle style={{ color: "gray" }} />
                    ) : (
                      "OPEN"
                    )}
                  </Button>
                </div>
              );
            }

            if (
              col?.TwoColumnData &&
              col?.TwoColumnData.trim() !== "" &&
              col?.TwoColumnData.trim() !== "0" &&
              col?.TwoColumnData !== "Select"
            ) {
              const secondValue = params?.row?.[col.TwoColumnData];
              const primaryValue =
                col?.ColumnDecimal && !isNaN(params.value)
                  ? Number(params.value).toFixed(col.ColumnDecimal)
                  : params.value;

              return (
                <span
                  style={{
                    color: col.Color || "inherit",
                    backgroundColor: col.BackgroundColor || "inherit",
                    fontSize: col.FontSize || "inherit",
                    textTransform: col.ColumTitleCapital ? "uppercase" : "none",
                    padding: "0px",
                    borderRadius: col.BorderRadius,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <p
                    className="osr_mainName"
                    style={{
                      display: "flex",
                      justifyContent:
                        col?.ColumnType == "Number" ? "flex-end" : "flex-start",
                    }}
                  >
                    {primaryValue}
                  </p>
                  <p
                    className="osr_subname"
                    style={{
                      display: "flex",
                      justifyContent:
                        col?.ColumnType == "Number" ? "flex-end" : "flex-start",
                    }}
                  >
                    {secondValue}
                  </p>
                </span>
              );
            }

            if (col?.ColumnDecimal && col?.ColumnDecimal != 0) {
              const value = params.value != null ? Number(params.value) : null;
              return (
                <span
                  style={{
                    color: col.FontColor || "inherit",
                    backgroundColor: col.BackgroundColor || "inherit",
                    fontSize: col.FontSize || "inherit",
                    textTransform: col.ColumTitleCapital ? "uppercase" : "none",
                    padding: "0px",
                    borderRadius: col.BorderRadius,
                  }}
                >
                  {value != null && !isNaN(value)
                    ? value.toFixed(col.ColumnDecimal)
                    : ""}
                </span>
              );
            }

            if (col?.PriorityColorColumn == "True") {
              const priorityColumn = allColumData?.find(
                (x) => x.IsPriorityColumn === "True"
              );
              if (!priorityColumn) return params.value;
              const priorityId = params?.row?.[priorityColumn.FieldName];
              const priorityObj = colorMaster?.find((x) => x.id == priorityId);
              const bg = priorityObj?.colorcode ?? "inherit";
              const font = priorityObj?.fontcolorcode ?? "inherit";

              return (
                <span
                  style={{
                    backgroundColor: bg,
                    color: font,
                    fontSize: col.FontSize || "12px",
                    padding: "3px 6px",
                    borderRadius: "15px",
                  }}
                >
                  {params.value}
                </span>
              );
            }

            if (col.CopyButton == "True") {
              const handleCopy = () => {
                navigator.clipboard
                  .writeText(displayValue)
                  .then(() => {
                    console.log("Copied to clipboard");
                  })
                  .catch((err) => {
                    console.error("Failed to copy: ", err);
                  });
              };

              return (
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      color: col.FontColor || "inherit",
                      backgroundColor: col.BackgroundColor || "inherit",
                      fontSize: col.FontSize || "12px",
                      textTransform: col.ColumTitleCapital
                        ? "uppercase"
                        : "none",
                      padding: "0px",
                      borderRadius: col.BorderRadius,
                    }}
                  >
                    {displayValue}
                  </span>
                  <Button
                    onClick={handleCopy}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      marginLeft: "8px",
                    }}
                    title="Copy to clipboard"
                  >
                    <GoCopy className="copyButton" />
                  </Button>
                </div>
              );
            }

            if (col.HrefLink == "true") {
              return (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "blue",
                    textDecoration: "underline",
                    fontSize: col.FontSize || "inherit",
                    padding: "0px",
                    cursor: "pointer",
                    width: "120px",
                    fontSize: col.FontSize || "inherit",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
                  onClick={() => handleCellClick(params, params?.colDef?.ColId)}
                >
                  {params.value}
                </a>
              );
            } else {
              return (
                <span
                  style={{
                    color: col.FontColor || "inherit",
                    backgroundColor: col.BackgroundColor || "inherit",
                    fontSize: col.FontSize || "12px",
                    textTransform: col.ColumTitleCapital ? "uppercase" : "none",
                    padding: "0px",
                    borderRadius: col.BorderRadius,
                  }}
                >
                  {params.value}
                </span>
              );
            }
          },
        };
      });

    const srColumn = {
      field: "sr",
      headerName: (
        <>
          {masterKeyData?.CheckBoxSelection == "True" ? (
            <>
              <Checkbox
                checked={
                  filteredRows?.length > 0 &&
                  selectionModel.length === filteredRows.length
                }
                indeterminate={
                  selectionModel.length > 0 &&
                  selectionModel.length < filteredRows.length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    const start =
                      paginationModel.page * paginationModel.pageSize;
                    const end = start + paginationModel.pageSize;
                    const pageRows = filteredRows.slice(start, end);
                    setSelectionModel(pageRows.map((r) => r.id));
                  } else {
                    // ✅ Clear all
                    setSelectionModel([]);
                  }
                }}
                size="small"
              />
              Sr#
            </>
          ) : (
            "Sr#"
          )}
        </>
      ),
      width: 90,
      sortable: false,
      DisplayOrder: "1",
      filterable: false,
      ColumnAlign: "left",
      renderCell: (params) => {
        const isChecked = selectionModel.includes(params.id);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {masterKeyData?.CheckBoxSelection == "True" && (
              <Checkbox
                size="small"
                checked={selectionModel.includes(params.id)}
                onChange={() => {
                  if (selectionModel.includes(params.id)) {
                    setSelectionModel((prev) =>
                      prev.filter((id) => id !== params.id)
                    );
                  } else {
                    setSelectionModel((prev) => [...prev, params.id]);
                  }
                }}
              />
            )}
            {paginationModel.page * paginationModel.pageSize +
              params.api.getRowIndexRelativeToVisibleRows(params.id) +
              1}
          </div>
        );
      },
    };

    const visibleColumns = [
      srColumn,
      ...columnData.filter((col) => col.HideColumn !== "True"),
    ];
    setColumns(visibleColumns);
    setColumnsHide([srColumn, ...columnData]);
    if (!defaultSortApplied.current && columnData?.length > 0) {
      const cand = columnData.find(
        (c) =>
          c.DefaultSort &&
          ["ascending", "descending"].includes(
            String(c.DefaultSort).toLowerCase()
          )
      );

      if (cand) {
        const hasField = visibleColumns.some((vc) => vc.field === cand.field);

        if (hasField) {
          const sortDir =
            String(cand.DefaultSort).toLowerCase() === "ascending"
              ? "asc"
              : "desc";

          initialSort.current = [{ field: cand.field, sort: sortDir }];
          setSortModel(initialSort.current);
        }
      }

      defaultSortApplied.current = true;
    }
  }, [allColumData, grupEnChekBox, paginationModel, selectionModel]);

  const buildIframeUrl = (params, colId, iframeTypeId) => {
    const row = params?.row || {};
    const rd1Item = iframeModelData?.rd1?.find(
      (x) => x.ColId == colId && x.IframeTypeId == iframeTypeId
    );
    const rdParams = iframeModelData?.rd?.filter(
      (x) => x.ColId == colId && x.IframeTypeId == iframeTypeId
    );
    if (!rd1Item || !rdParams) return "";
    const getRowValue = (paramName) => {
      const key = Object.keys(row).find(
        (k) => k.toLowerCase() === paramName.toLowerCase()
      );
      return key ? row[key] : "";
    };
    const queryString = rdParams
      .map((p) => {
        if (p.IsStatic === true || p.IsStatic === "true") {
          return `${p.ParameterName}=${encodeURIComponent(p.ParameterValue)}`;
        } else {
          return `${p.ParameterName}=${encodeURIComponent(
            getRowValue(p.ParameterName) || ""
          )}`;
        }
      })
      .join("&");
    return `${rd1Item.BaseUrl}${rd1Item.ReportRedirectUrl}&${queryString}`;
  };

  const waitForIframeData = async () => {
    let retries = 10; // retry max 10 times
    let delay = 300; // 300ms interval
    while (retries > 0) {
      if (iframeModelData && iframeModelData.rd1 && iframeModelData.rd) {
        return iframeModelData; // data ready
      }
      await new Promise((res) => setTimeout(res, delay)); // wait
      retries--;
    }

    return null; // still no data
  };

  const openIframe = async (params, columId, iframeTypeId) => {
    const data = await waitForIframeData();
    if (!data) {
      console.warn("iframeModelData not loaded even after waiting");
      return;
    }
    const url = buildIframeUrl(params, columId, iframeTypeId);
    setIframeUrl(url);
    setOpenHrefModel(true);
  };

  const handleCellClick = (params, colId) => {
    if (!navigationData) return;
    const rd1Item = navigationData.rd1.find((item) => item.ColId == colId);
    if (!rd1Item) {
      console.warn("No rd1 found for ColId:", colId);
      return;
    }
    const baseUrl = rd1Item.BaseUrl || "";
    const redirectUrl = rd1Item.ReportRedirectUrl || "";
    const rdParams = navigationData.rd.filter((item) => item.ColId == colId);
    const getRowValue = (paramName) => {
      const row = params?.row || {};
      const key = Object.keys(row).find(
        (k) => k.toLowerCase() === paramName.toLowerCase()
      );
      return key ? row[key] : "";
    };
    const queryParams = rdParams
      .map((item) => {
        const { VariableName, VariableValue, IsStatic } = item;
        if (IsStatic === "true") {
          return `${VariableName}=${encodeURIComponent(VariableValue)}`;
        } else {
          const dynamicVal = getRowValue(VariableName) || VariableValue || "";
          return `${VariableName}=${btoa(dynamicVal)}`;
        }
      })
      .join("&");
    const fullUrl = `${baseUrl}${redirectUrl}&${queryParams}`;
    const navigatePageId = params?.colDef?.RedirectId || "";
    const navigateObj = navigationPageMaster?.rd1?.find(
      (x) => x.RedirectId === Number(navigatePageId)
    );
    const navigateName = navigateObj?.RedirectPage || "";
    if (window?.parent?.postMessage) {
      window.parent.postMessage(
        {
          type: "ADD_TAB",
          evt: "DynamicReport",
          payload: {
            TabName: navigateName,
            TabUrl: fullUrl,
          },
        },
        "*"
      );
    }
  };

  const buildMasterValueMap = (masterData) => {
    const map = {};
    Object.keys(masterData || {}).forEach((key) => {
      if (key.startsWith("rd") && key !== "rd") {
        (masterData[key] || []).forEach((item) => {
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
    () => buildMasterValueMap(masterData),
    [masterData]
  );

  useEffect(() => {
    if (apiRef.current) {
      const gridElement = apiRef.current.rootElementRef.current;

      if (gridElement) {
        const handleDoubleClick = (e) => {
          // Check if double-click is on column separator
          if (e.target.classList.contains("MuiDataGrid-columnSeparator")) {
            e.preventDefault();
            e.stopPropagation();

            // Auto-resize ALL columns
            apiRef.current.autosizeColumns({
              includeHeaders: true,
              includeOutliers: true,
            });
          }
        };

        gridElement.addEventListener("dblclick", handleDoubleClick, true);

        return () => {
          gridElement.removeEventListener("dblclick", handleDoubleClick, true);
        };
      }
    }
  }, [apiRef]);

  const originalRows =
    allColumIdWiseName &&
    allRowData?.map((row, index) => {
      const formattedRow = {};
      Object.keys(row).forEach((key) => {
        const colName = allColumIdWiseName[0][key];
        const colDef = allColumData?.find((c) => c.FieldName === colName);
        if (colDef?.MasterId && colDef.MasterId !== 0) {
          const rawValue = row[key];
          const mappedValue =
            masterValueMap[colDef.MasterId]?.[rawValue] ?? rawValue;
          formattedRow[colName] = mappedValue;
        } else {
          formattedRow[colName] = row[key];
        }
      });

      return { id: index, ...formattedRow };
    });

  const isFirstLoad = useRef(true);
  useEffect(() => {
    if (allColumData) {
      const dateCols = allColumData?.filter((col) => col.ColumnType == "Date");
      setDateColumnOptions(
        dateCols.map((col) => ({
          field: col.FieldName,
          label: col.HeaderName,
        }))
      );
      if (isFirstLoad.current && dateCols.length > 0) {
        setSelectedDateColumn(dateCols[0].FieldName);
        isFirstLoad.current = false;
      }
    }
  }, [allColumData]);

  const [filteredRows, setFilteredRows] = useState(originalRows);
  const [filters, setFilters] = useState({});
  const [filtersShow, setFiltersShow] = useState({});

  useEffect(() => {
    const filtersArray = filtersShow
      ? Object.entries(filtersShow)
          .filter(
            ([_, value]) =>
              value !== "" && value !== null && value !== undefined
          )
          .map(([key, value]) => {
            if (Array.isArray(value) && value.length === 0) return null;
            return { name: key, value };
          })
          .filter(Boolean)
      : [];

    const merged = [
      ...filtersArray,
      ...(Array.isArray(filteredValue) ? filteredValue : []),
    ];

    const uniqueMerged = merged.reduce((acc, current) => {
      const exists = acc.find((item) => item.name === current.name);
      if (!exists) acc.push(current);
      return acc;
    }, []);

    setFilteredValue(uniqueMerged);
  }, [filters, filteredValue, filtersShow]);

  useEffect(() => {
    const newFilteredRows = originalRows?.filter((row) => {
      let isMatch = true;

      for (const filterField of Object.keys(filters)) {
        const filterValue = filters[filterField];
        if (!filterValue || filterValue.length === 0) continue;

        const rawRowValue = row[filterField];

        if (filterField.includes("_min") || filterField.includes("_max")) {
          const baseField = filterField.replace("_min", "").replace("_max", "");
          const rowValue = parseFloat(row[baseField]);

          if (isNaN(rowValue)) {
            isMatch = false;
            break;
          }

          if (
            filterField.includes("_min") &&
            parseFloat(filterValue) > rowValue
          ) {
            isMatch = false;
            break;
          }

          if (
            filterField.includes("_max") &&
            parseFloat(filterValue) < rowValue
          ) {
            isMatch = false;
            break;
          }
        } else if (Array.isArray(filterValue)) {
          if (!filterValue.includes(rawRowValue)) {
            isMatch = false;
            break;
          }
        } else {
          const rowValue = rawRowValue?.toString().toLowerCase() || "";
          const filterValueLower = filterValue.toLowerCase();
          if (rowValue !== filterValueLower) {
            isMatch = false;
            break;
          }
        }
      }

      // Priority color filter
      if (isMatch && selectedColors?.length > 0) {
        const priorityCol = allColumData?.find(
          (x) => x.IsPriorityColumn === "True"
        );
        if (priorityCol) {
          const priorityValue = row[priorityCol.FieldName];
          if (!selectedColors.includes(priorityValue)) {
            isMatch = false;
          }
        }
      }

      // Date filter
      if (isMatch && !spliterReportShow && filterState && selectedDateColumn) {
        // const toDateOnly = (d) => new Date(new Date(d).toDateString());
        const toUTCDateOnly = (d) =>
          new Date(
            Date.UTC(
              new Date(d).getUTCFullYear(),
              new Date(d).getUTCMonth(),
              new Date(d).getUTCDate()
            )
          );
        const rowDate = toUTCDateOnly(row[selectedDateColumn]);
        const parsedStart = toUTCDateOnly(startDate);
        const parsedEnd = toUTCDateOnly(endDate);

        if (
          isNaN(rowDate.getTime()) ||
          rowDate < parsedStart ||
          rowDate > parsedEnd
        ) {
          isMatch = false;
        }
      }

      // Common search
      if (isMatch && commonSearch) {
        const searchText = commonSearch.toLowerCase();
        const hasMatch = Object.values(row).some((value) =>
          value?.toString().toLowerCase().includes(searchText)
        );
        if (!hasMatch) {
          isMatch = false;
        }
      }

      return isMatch;
    });

    let rowsWithSrNo = newFilteredRows?.map((row, index) => ({
      ...row,
      srNo: index + 1,
    }));

    const selectedCurrencyObj = currencyMaster?.find(
      (c) => c.Currencycode === selectedCurrency
    );
    const rate = selectedCurrencyObj?.CurrencyRate || 1;

    const currencyColumns = allColumData?.filter(
      (col) => col.IsCurrency === "True"
    );

    rowsWithSrNo = rowsWithSrNo?.map((row) => {
      let updatedRow = { ...row };
      currencyColumns?.forEach((col) => {
        const field = col.FieldName;
        if (updatedRow[field]) {
          updatedRow[field] = parseFloat((updatedRow[field] / rate).toFixed(2));
        }
      });

      return updatedRow;
    });
    if (masterKeyData?.GroupCheckBox == "True") {
      setFilteredRows(groupRows(rowsWithSrNo, grupEnChekBox));
    } else {
      setFilteredRows(rowsWithSrNo);
    }
  }, [
    filters,
    commonSearch,
    startDate,
    columns,
    selectedDateColumn,
    selectedColors,
    selectedCurrency,
  ]);

  const summaryColumns = columnsHide?.filter((col) => {
    const columnData = Object?.values(allColumData)?.find(
      (data) => data?.FieldName === col?.field
    );
    return String(columnData?.Summary).toLowerCase() === "true";
  });

  const unicSummaryColumns = columnsHide?.filter((col) => {
    const columnData = Object?.values(allColumData)?.find(
      (data) => data?.FieldName === col?.field
    );
    return String(columnData?.IsUniqueCount).toLowerCase() === "true";
  });

  const finalSummaryColumns = [...summaryColumns, ...unicSummaryColumns];
  const renderSummary = () => {
    const sortedSummaryColumns = [...finalSummaryColumns].sort((a, b) => {
      const aOrder = a.SummeryOrder;
      const bOrder = b.SummeryOrder;
      if (!aOrder && !bOrder) return 0;
      if (aOrder && !bOrder) return -1;
      if (!aOrder && bOrder) return 1;
      return Number(aOrder) - Number(bOrder);
    });

    return (
      <div
        className="summaryBox"
        style={{
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {sortedSummaryColumns.map((col) => {
          const columnMeta = Object.values(allColumData)?.find(
            (data) => data.FieldName === col.field
          );

          const isUniq =
            String(columnMeta?.IsUniqueCount).toLowerCase() === "true";

          let calculatedValue = 0;

          if (isUniq) {
            const allValues = filteredRows?.map((row) => row[col.field]) || [];
            const uniqueValues = [...new Set(allValues)];
            calculatedValue = uniqueValues.length;
          } else {
            calculatedValue =
              filteredRows?.reduce(
                (sum, row) => sum + (parseFloat(row[col.field]) || 0),
                0
              ) || 0;
          }

          return (
            <div
              key={col.field}
              className={
                sortedSummaryColumns.length >= 3
                  ? sortedSummaryColumns.length >= 9
                    ? "AllEmploe_boxViewTotal_big_more"
                    : "AllEmploe_boxViewTotal_big"
                  : "AllEmploe_boxViewTotal"
              }
            >
              <div>
                <p className="AllEmplo_boxViewTotalValue">
                  {isUniq
                    ? calculatedValue
                    : col?.SummaryValueFormated == 1
                    ? Number(calculatedValue).toLocaleString("en-IN", {
                        minimumFractionDigits: col?.SummaryValueKey,
                        maximumFractionDigits: col?.SummaryValueKey,
                      })
                    : calculatedValue.toFixed(Number(col?.SummaryValueKey))}
                  <span style={{ fontSize: "17px" }}>{col?.SummaryUnit}</span>
                </p>

                <p className="boxViewTotalTitle">
                  {columnMeta?.SummaryTitle == null ||
                  columnMeta?.SummaryTitle == ""
                    ? col?.headerNameSub
                    : columnMeta?.SummaryTitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handlePaginationChange = (newModel) => {
    setIsPageChanging(true);
    setPaginationModel(newModel);

    const keyPrefix = `${pid}_`;
    const matchingKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith(keyPrefix)
    );
    if (!matchingKey) {
      console.warn("No ReportId found in sessionStorage for pid", pid);
      return;
    }
    const reportId = matchingKey.split("_")[1];

    saveReportActivity(reportId, {
      ActionName: "PAGINATION",
      ActionOn: "pageno",
      ActionValue: String(newModel.page + 1),
    });

    saveReportActivity(reportId, {
      ActionName: "PAGINATION",
      ActionOn: "pagesize",
      ActionValue: String(newModel.pageSize),
    });
    setTimeout(() => {
      setIsPageChanging(false);
    }, 400);
  };

  const handleClickOpenPoup = () => {
    setOpenPopup(true);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const updated = Array.from(allColumData);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    setAllColumData(updated);
  };

  const groupRows = (rows, groupCheckBox) => {
    if (!Array.isArray(rows)) return [];
    const grouped = [];
    const allTrue = Object.values(groupCheckBox).every(Boolean);
    if (allTrue) {
      return rows.map((item, index) => ({
        ...item,
        id: index,
        srNo: index + 1,
      }));
    }
    const tempGrouped = {};
    rows.forEach((row) => {
      const newRow = { ...row };
      const keyParts = [];
      for (const [field, checked] of Object.entries(groupCheckBox)) {
        if (checked) {
          keyParts.push(row[field] ?? "");
        } else {
          newRow[field] = "-";
        }
      }

      const groupKey = keyParts.join("|");
      if (!tempGrouped[groupKey]) {
        tempGrouped[groupKey] = { ...newRow };
      } else {
        for (const col of allColumData) {
          const fieldName = col.FieldName;
          const isGroupCol =
            col.GrupChekBox === "True" && groupCheckBox[fieldName];
          const isNumeric = col.ColumnType === "Number";
          if (!isGroupCol && isNumeric) {
            const oldVal = Number(tempGrouped[groupKey][fieldName]) || 0;
            const newVal = Number(row[fieldName]) || 0;
            tempGrouped[groupKey][fieldName] = oldVal + newVal;
          }
        }
      }
    });
    return Object.values(tempGrouped).map((item, index) => ({
      ...item,
      id: index,
      srNo: index + 1,
    }));
  };

  const handleSaveSettings = async () => {
    setColumSaveLoding(true);
    let reportId = null;
    const keyPrefix = `${pid}_`;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(keyPrefix)) {
        reportId = key.split("_")[1];
        break;
      }
    }
    if (!reportId) {
      console.warn("No ReportId found in sessionStorage for pid", pid);
      return;
    }
    try {
      const updatedData = allColumData.map((col, idx) => ({
        ...col,
        IsVisible: checkedColumns[col.FieldName] ? "True" : "False",
        DisplayOrder: idx + 1,
      }));
      const columnsPayload = updatedData.map((col) => ({
        ColId: parseInt(col.ColId, 10),
        IsVisible: col.IsVisible,
        DisplayOrder: col.DisplayOrder,
      }));
      let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

      const body = {
        con: JSON.stringify({
          mode: "updateCompanyReportColumns",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify({
          ReportId: reportId,
          Columns: columnsPayload,
        }),
        f: "DynamicReport (update display order test)",
      };
      const response = await CallApi(body);
      if (response?.rd[0]?.stat === 1) {
        setAllColumData(updatedData);
        sessionStorage.setItem(
          "savedColumns_" + reportName,
          JSON.stringify(updatedData)
        ); // ✅ store
        setOpenSnackbar(true);
        setColumSaveLoding(false);
      } else {
        console.warn("Failed to update DisplayOrder:", response?.stat_msg);
        setColumSaveLoding(false);
      }
    } catch (error) {
      console.error("handleSaveSettings failed:", error);
      setColumSaveLoding(false);
    }
  };

  const handlePrintNow = (currentPageItems, currentPage) => {
    setPreparingPrint(true);
    setCurrentPrintPage(currentPage);

    requestAnimationFrame(() => {
      waitForPrintReady(currentPageItems);
    });
  };

  const waitForPrintReady = (itemsToPrint) => {
    const container = printRef.current;
    if (!container) return;

    const images = container.querySelectorAll(".print-content img");
    const imagePromises = Array.from(images).map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        })
    );

    Promise.all(imagePromises).then(() => {
      let attempts = 0;
      const maxAttempts = 100;

      const checkLayout = () => {
        requestAnimationFrame(() => {
          attempts++;
          const items = container.querySelectorAll(".print-content .col1");
          if (items.length >= itemsToPrint.length || attempts >= maxAttempts) {
            setPreparingPrint(false);
            setTimeout(() => {
              window.print();
            }, 300);
          } else {
            checkLayout();
          }
        });
      };

      checkLayout();
    });
  };

  if (showPrintView) {
    return (
      <div
        ref={printRef}
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
          overflowY: "auto",
        }}
      >
        <div
          className="print-control-buttons"
          style={{
            textAlign: "center",
            paddingBlock: "30px",
            position: "fixed",
            top: "0px",
            width: "100%",
            backgroundColor: "white",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handlePrintNow}
            disabled={preparingPrint}
            sx={{
              backgroundColor: "#2e7d32",
              "&:hover": { backgroundColor: "#1b5e20" },
            }}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setShowPrintView(false)}
            sx={{ marginLeft: "10px" }}
          >
            Cancel
          </Button>
        </div>
        <Print1JewelleryBook
          visibleItemsMain={printData}
          onPrintClick={handlePrintNow}
          preparingPrint={preparingPrint}
          currentPrintPage={currentPrintPage}
        />
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {showPrintView ? (
        <div ref={printRef}>
          <Print1JewelleryBook visibleItemsMain={printData} />
        </div>
      ) : (
        <div
          className="dynamic_sample_report_main"
          sx={{ width: "100vw", display: "flex", flexDirection: "column" }}
          ref={gridContainerRef}
        >
          <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={() => setOpenSnackbar(false)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
              Column Update Successfully!
            </Alert>
          </Snackbar>

          <Dialog
            open={openHrefModel}
            onClose={() => setOpenHrefModel(false)}
            PaperProps={{
              sx: {
                height: "40vh",
                borderRadius: 2,
                overflow: "hidden",
                width: "600px",
              },
            }}
          >
            <div
              style={{
                position: "absolute",
                right: "10px",
                top: "10px",
              }}
            >
              <IconButton
                edge="end"
                size="small"
                onClick={() => setOpenHrefModel(false)}
                aria-label="clear"
                style={{ border: "1px solid #b3c6ff" }}
              >
                <X size={18} color="black" />
              </IconButton>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "20px",
                height: "100%",
              }}
            >
              <iframe
                src={iframeUrl}
                title="iframe-preview"
                style={{
                  border: "none",
                  height: "100%",
                }}
              />
            </div>
          </Dialog>

          <Dialog
            open={openPopup}
            onClose={() => setOpenPopup(false)}
            container={gridContainerRef.current}
          >
            <div className="colum_setting_model_main">
              <div className="filterDrawer">
                <p className="title">Column Rearrange</p>

                <Droppable droppableId="columns-list" type="COLUMN">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="columns-list"
                    >
                      {allColumData
                        .filter((col) => col.HideColumn !== "True")
                        .map((col, index) => (
                          <DraggableColumn
                            key={col.FieldName}
                            col={col}
                            index={index}
                            checkedColumns={checkedColumns}
                            handleCheckboxChange={() =>
                              setCheckedColumns((prev) => ({
                                ...prev,
                                [col.FieldName]: !prev[col.FieldName],
                              }))
                            }
                          />
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <div className="btn-container">
                  <Button
                    variant="contained"
                    color="primary"
                    className="btn_SaveColumModel"
                    onClick={handleSaveSettings}
                    disabled={columSaveLoding}
                  >
                    {columSaveLoding ? (
                      <span className="loading-text">
                        {"Loading...".split("").map((char, index) => (
                          <span key={index} style={{ "--i": index }}>
                            {char}
                          </span>
                        ))}
                      </span>
                    ) : (
                      "Save"
                    )}
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    className="btn_CancelColumModel"
                    onClick={handleClosePopup}
                  >
                    cancel
                  </Button>
                </div>
              </div>
            </div>
          </Dialog>

          <Drawer
            open={sideFilterOpen}
            onClose={toggleDrawer(false)}
            className="drawerMain"
            ModalProps={{
              container: gridContainerRef.current,
              disablePortal: true,
            }}
          >
            <FilterDrawer
              setSideFilterOpen={setSideFilterOpen}
              setDraftFilters={setDraftFilters}
              setCommonSearch={setCommonSearch}
              setFiltersShow={setFiltersShow}
              setFilters={setFilters}
              setFilteredValue={setFilteredValue}
              filteredValueState={filteredValueState}
              columnsHide={columnsHide}
              draftFilters={draftFilters}
              toggleDrawer={toggleDrawer}
              onSearchFilter={onSearchFilter}
              originalRows={originalRows}
              masterKeyData={masterKeyData}
              grupEnChekBox={grupEnChekBox}
              fullscreenContainer={fullscreenContainer}
              setSuggestionVisibility={setSuggestionVisibility}
              suggestionVisibility={suggestionVisibility}
              setHighlightedIndex={setHighlightedIndex}
              highlightedIndex={highlightedIndex}
              apiRef={apiRef}
              commonSearch={commonSearch}
              selectedDateColumn={selectedDateColumn}
              saveReportActivity={saveReportActivity}
              endDate={endDate}
              startDate={startDate}
            />
          </Drawer>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog
              open={Boolean(activeActionColumn)}
              onClose={() => setActiveActionColumn(null)}
              maxWidth="xs"
              fullWidth
            >
              <ActionFilter
                selectionModel={selectionModel}
                setTempValue={setTempValue}
                tempValue={tempValue}
                activeActionColumn={activeActionColumn}
                spNumber={spNumber}
                setFilteredRows={setFilteredRows}
                setActiveActionColumn={setActiveActionColumn}
              />
            </Dialog>
          </LocalizationProvider>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "5px 10px 0px 10px",
            }}
          >
            <div style={{ display: "flex" }}>
              <div style={{ display: "flex", gap: "15px" }}>
                {showReportMaster && (
                  <Button
                    variant="outlined"
                    onClick={onBack}
                    className="Btn_BackErrow"
                  >
                    <ArrowLeft color="#7367f0b3" />
                  </Button>
                )}
                <div style={{ display: "flex", gap: "10px" }}>
                  {filteredValueState?.map((data, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <p className="FilterValue_title">{data.name} : </p>
                      <p className="FilterValue_Value">{" " + data.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {masterKeyData?.ColumnSettingModel == "True" && (
                <Tooltip
                  title="Column Rearrange"
                  isablePortal
                  PopperProps={{
                    container: gridContainerRef.current,
                  }}
                >
                  <IconButton
                    onClick={handleClickOpenPoup}
                    sx={{
                      background: "#cdd5ff",
                      color: "#6f53ff",
                      height: "42px",
                      width: "42px",
                      borderRadius: "6px",
                      transition: "all .2s ease",
                      "&:hover": {
                        backgroundColor: "#cdd5ff",
                        transform: "translateY(-2px)",
                      },
                    }}
                    size="medium"
                    className="btn_column_setting_model"
                  >
                    <AiFillSetting size={22} />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </div>
          <div>{renderSummary()}</div>
          <ReportTopFilterEndAction
            isLoading={isLoading}
            toggleDrawer={toggleDrawer}
            spliterReportShow={spliterReportShow}
            masterKeyData={masterKeyData}
            selectedDateColumn={selectedDateColumn}
            setSelectedDateColumn={setSelectedDateColumn}
            dateColumnOptions={dateColumnOptions}
            filterState={filterState}
            setFilterState={setFilterState}
            gridContainerRef={gridContainerRef}
            allColumData={allColumData}
            setIsPageChanging={setIsPageChanging}
            setCommonSearch={setCommonSearch}
            setFiltersShow={setFiltersShow}
            setFilters={setFilters}
            setDraftFilters={setDraftFilters}
            setFilteredValue={setFilteredValue}
            showReportMaster={showReportMaster}
            onSearchFilter={onSearchFilter}
            saveReportActivity={saveReportActivity}
            commonSearch={commonSearch}
            setActiveActionColumn={setActiveActionColumn}
            setTempValue={setTempValue}
            colorMaster={colorMaster}
            setSelectedColors={setSelectedColors}
            selectedColors={selectedColors}
            setSelectedCurrency={setSelectedCurrency}
            selectedCurrency={selectedCurrency}
            currencyMaster={currencyMaster}
            filteredRows={filteredRows}
            sortModel={sortModel}
            columns={columns}
            setShowPrintView={setShowPrintView}
            setPrintData={setPrintData}
            grupEnChekBoxImage={grupEnChekBoxImage}
            showImageView={showImageView}
            setShowImageView={setShowImageView}
            reportName={reportName}
          />
          <div
            ref={gridRef}
            style={{
              height: showImageView
                ? summaryColumns?.length == 0
                  ? "77vh"
                  : "70vh"
                : summaryColumns?.length == 0
                ? masterKeyData?.ColumnSettingModel == "True"
                  ? "calc(100vh - 190px)"
                  : "calc(100vh - 130px)"
                : finalSummaryColumns?.length > 9
                ? finalSummaryColumns?.length > 18
                  ? "calc(100vh - 370px)"
                  : "calc(100vh - 300px)"
                : "calc(100vh - 255px)",
              margin: "5px 10px",
              overflow: "auto",
              transition: "opacity 0.3s",
              opacity: isPageChanging ? 0.5 : 1,
            }}
            className="dataGrid_Warper"
          >
            {showImageView ? (
              <div>
                <ImageView
                  filteredRows={filteredRows}
                  sortModel={sortModel}
                  columns={columns}
                />
              </div>
            ) : (
              <Warper>
                <DataGrid
                  loading={isLoading}
                  apiRef={apiRef}
                  rows={filteredRows ?? []}
                  columns={columns ?? []}
                  autoHeight={false}
                  columnBuffer={17}
                  rowHeight={40}
                  getRowClassName={(params) =>
                    params.row.IsClub === 1 ? "yellow-row" : ""
                  }
                  sortModel={sortModel}
                  onSortModelChange={(model) => {
                    if (!model.length) return;

                    const keyPrefix = `${pid}_`;
                    const matchingKey = Object.keys(sessionStorage).find(
                      (key) => key.startsWith(keyPrefix)
                    );

                    if (!matchingKey) {
                      console.warn(
                        "No ReportId found in sessionStorage for pid",
                        pid
                      );
                      return;
                    }

                    const reportId = matchingKey.split("_")[1];
                    const { field, sort } = model[0];
                    const column = apiRef.current.getColumn(field);
                    const actionOn = column?.headerName || field;

                    saveReportActivity(reportId, {
                      ActionName: "SORT",
                      ActionOn: actionOn,
                      ActionValue: sort,
                    });

                    setSortModel(model);
                  }}
                  localeText={{ noRowsLabel: "No Data" }}
                  initialState={{
                    columns: {
                      columnVisibilityModel: {
                        status: false,
                        traderName: false,
                      },
                    },
                  }}
                  slots={{
                    pagination: CustomPagination,
                  }}
                  sortingOrder={["asc", "desc"]}
                  sortingMode="client"
                  paginationModel={paginationModel}
                  onPaginationModelChange={handlePaginationChange} // ✅ use wrapped function
                  className="simpleGridView"
                  pagination
                  sx={{
                    "& .MuiDataGrid-menuIcon": {
                      display: "none",
                    },
                    "& .MuiDataGrid-selectedRowCount": {
                      display: "none",
                    },
                  }}
                />
              </Warper>
            )}
          </div>

          {status500 && (
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <Box
                minHeight="70vh"
                display="flex"
                alignItems="center"
                justifyContent="center"
                p={2}
              >
                <Paper
                  elevation={3}
                  sx={{
                    maxWidth: 500,
                    width: "100%",
                    p: 4,
                    borderRadius: "20px",
                    textAlign: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    mb={2}
                  >
                    <AlertTriangle size={48} color="#f44336" />
                  </Box>

                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Something Went Wrong
                  </Typography>

                  <Typography variant="body1" color="text.secondary" mb={3}>
                    We're sorry, but an unexpected error has occurred. Please
                    try again later.
                  </Typography>
                </Paper>
              </Box>
            </div>
          )}
        </div>
      )}
    </DragDropContext>
  );
}