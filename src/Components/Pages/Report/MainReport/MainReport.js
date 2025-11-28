import React, { useState, useEffect, useRef, useMemo } from "react";
import Box from "@mui/material/Box";
import "./MainReport.scss";
// import mainButton from "../../../images/Mail_32.png";
import noFoundImg from "../../../images/noFound.jpg";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "react-datepicker/dist/react-datepicker.css";
import { RiFullscreenLine } from "react-icons/ri";
import ReactDOM from "react-dom/client";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  Slide,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import emailjs from "emailjs-com";
import {
  MdExpandMore,
  MdOutlineFilterAlt,
  MdOutlineFilterAltOff,
} from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AiFillSetting } from "react-icons/ai";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowLeftToLine,
  CircleX,
  Ellipsis,
  FileSpreadsheet,
  Grip,
  GripHorizontal,
  ImageUp,
  Image,
  ImageUpscale,
  LayoutGrid,
  Search,
  X,
  NotebookPen,
  Printer,
  MessageCircle,
} from "lucide-react";
import { GoCopy } from "react-icons/go";
import {
  GridPagination,
  useGridApiContext,
  useGridSelector,
  gridPageSelector,
  gridPageCountSelector,
} from "@mui/x-data-grid";
import {
  FirstPage,
  LastPage,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
// import DynamicIcon from "../../../../Utils/Icone/DynamicIcon";
import DualDatePicker from "../../../../Utils/DatePicker/DualDatePicker";
import Warper from "../../warper";
import { CallApi } from "../../../../API/CallApi/CallApi";
import { FaPrint } from "react-icons/fa";
import dayjs from "dayjs";
import { ReportCallApi } from "../../../../API/ReportCommonAPI/ReportCallApi";
import Print1JewelleryBook from "./Print1JewelleryBook";
const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";

const DraggableColumn = ({
  col,
  index,
  handleCheckboxChange,
  checkedColumns,
}) => {
  return (
    <Draggable draggableId={col.FieldName.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="banner_card"
          style={{
            opacity: snapshot.isDragging ? 0.5 : 1,
            cursor: "grab",
            transition: "opacity 0.2s ease",
            ...provided.draggableProps.style,
            boxShadow:
              "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
            padding: "5px 10px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            {/* <Grip color="#5c62dc"/> */}
            <GripHorizontal color="#aeadad " />
            <p style={{ margin: "0px" }}>{col.HeaderName}</p>
          </div>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!checkedColumns[col.FieldName]}
                onChange={() => handleCheckboxChange(col.FieldName)}
                sx={{
                  "&.Mui-checked": {
                    color: "rgb(115, 103, 240)",
                  },
                }}
              />
            }
            sx={{
              "& .MuiCheckbox-sizeSmall": {
                display: "none!important",
              },
            }}
          />
        </div>
      )}
    </Draggable>
  );
};

const formatToMMDDYYYY = (date) => {
  const d = new Date(date);
  return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d
    .getDate()
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
};

function CustomPagination() {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const rowCount = apiRef.current.getRowsCount();
  const pageSize = apiRef.current.state.pagination.paginationModel.pageSize;
  const [inputPage, setInputPage] = React.useState(page + 1);

  React.useEffect(() => {
    setInputPage(page + 1);
  }, [page]);

  const handleInputChange = (e) => {
    setInputPage(e.target.value);
  };

  const handleInputBlur = () => {
    let newPage = Number(inputPage);

    if (isNaN(newPage) || newPage < 1) {
      newPage = 1;
    } else if (newPage > pageCount) {
      newPage = pageCount;
    }

    apiRef.current.setPage(newPage - 1);
    setInputPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    apiRef.current.setPageSize(Number(e.target.value));
  };

  const startItem = page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, rowCount);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        width: "100%",
        padding: "0 8px",
        gap: 16,
      }}
    >
      {/* ✅ Page navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>Rows per page:</span>
        <TextField
          select
          size="small"
          value={pageSize}
          onChange={handlePageSizeChange}
          SelectProps={{
            native: true,
          }}
          style={{ width: 60 }}
          sx={{
            "& .MuiNativeSelect-select": {
              padding: "2px 5px!important",
              fontSize: "14px !important",
            },
          }}
        >
          {[20, 30, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </TextField>

        <IconButton
          size="small"
          onClick={() => apiRef.current.setPage(0)}
          disabled={page === 0}
        >
          <FirstPage fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => apiRef.current.setPage(page - 1)}
          disabled={page === 0}
        >
          <KeyboardArrowLeft fontSize="small" />
        </IconButton>

        <p>Page</p>
        <TextField
          value={inputPage}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleInputBlur();
            }
          }}
          size="small"
          variant="outlined"
          style={{ width: 60 }}
          inputProps={{ style: { textAlign: "center", padding: "2px 4px" } }}
        />
        <span style={{ fontSize: 14 }}>of {pageCount}</span>

        <IconButton
          size="small"
          onClick={() => apiRef.current.setPage(page + 1)}
          disabled={page >= pageCount - 1}
        >
          <KeyboardArrowRight fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => apiRef.current.setPage(pageCount - 1)}
          disabled={page >= pageCount - 1}
        >
          <LastPage fontSize="small" />
        </IconButton>

        <span style={{ fontSize: 14 }}>
          Displaying {rowCount === 0 ? 0 : startItem} to {endItem} of {rowCount}
        </span>
      </div>
    </div>
  );
}

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
}) {
  const [isLoading, setIsLoading] = useState(isLoadingChek);
  const gridContainerRef = useRef(null);
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
  const gridRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [status500, setStatus500] = useState(false);
  const [commonSearch, setCommonSearch] = useState("");
  const [sortModel, setSortModel] = useState([]);
  const [activeActionColumn, setActiveActionColumn] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [dateColumnOptions, setDateColumnOptions] = useState([]);
  const [selectedDateColumn, setSelectedDateColumn] = useState("");
  const [filteredValueState, setFilteredValue] = useState();
  const [filterState, setFilterState] = useState({
    dateRange: { startDate: null, endDate: null },
  });
  const startDate = filterState?.dateRange?.startDate;
  const endDate = filterState?.dateRange?.endDate;
  const apiRef = useGridApiRef();
  const [grupEnChekBox, setGrupEnChekBox] = useState({});
  const [grupEnChekBoxImage, setGrupEnChekBoxImage] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const pid = searchParams.get("pid");
  const firstTimeLoadedRef = useRef(false);
  const [showReportMaster, setShowReportMaster] = useState(showBackErrow);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [printData, setPrintData] = useState([]);
  const [navigationData, setNavigationData] = useState();
  const [iframeModelData, setIframeModelData] = useState();
  const printRef = useRef();
  const [sideFilterOpen, setSideFilterOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [iframeUrl, setIframeUrl] = useState("");
  const [navigationPageMaster, setNavigationPageMaster] = useState();

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
    setGrupEnChekBox((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));

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

  const defaultSortApplied = useRef(false);
  const initialSort = useRef(null);

  useEffect(() => {
    if (!allColumData) return;
    const toBool = (val) => String(val).toLowerCase() === "true";
    const columnData = Object?.values(allColumData)
      ?.filter((col) => col.IsVisible == "True")
      ?.map((col, index) => {
        return {
          field: col.FieldName,
          headerName: (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {col?.GrupChekBox == "True" &&
                masterKeyData?.GroupCheckBox == "True" && (
                  <Checkbox
                    checked={grupEnChekBox[col.FieldName] ?? true}
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
              {col.HeaderName}
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
          IconName: col.IconName,
          SummaryUnit: col.SummaryUnit,
          ColumnDecimal: col.ColumnDecimal,
          HideColumn: col.HideColumn,
          CopyButton: col.CopyButton,
          ColId: col.ColId,
          RedirectId: col?.RedirectId,
          IframeTypeId: col.IframeTypeId,
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
                  {params.value?.toFixed(col?.ColumnDecimal)}
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

            if (col.ColumnType == "Date") {
              const formattedDate = params.value
                ? new Date(params.value).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "";

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

  const openIframe = (params, columId, iframeTypeId) => {
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

    if (window?.parent?.addTab) {
      window.parent.addTab(
        navigateName,
        "icon-InventoryManagement_invoiceSummary",
        fullUrl
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

  useEffect(() => {
    if (allColumData) {
      const dateCols = allColumData.filter((col) => col.ColumnType == "Date");
      setDateColumnOptions(
        dateCols.map((col) => ({
          field: col.FieldName,
          label: col.HeaderName,
        }))
      );

      if (dateCols.length > 0) {
        setSelectedDateColumn(dateCols[0].FieldName);
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

      if (isMatch && selectedColors?.length > 0) {
        const priorityCol = allColumData?.find(
          (x) => x.IsPriorityColumn === "True"
        );

        if (priorityCol) {
          const priorityValue = row[priorityCol.FieldName];

          if (!selectedColors.includes(priorityValue)) {
            isMatch = false; // ❌ row doesn't match selected priority colors
          }
        }
      }

      if (!spliterReportShow) {
        if (isMatch && filterState && selectedDateColumn) {
          const toDateOnly = (d) => new Date(new Date(d).toDateString());
          const rowDate = toDateOnly(row[selectedDateColumn]);
          const parsedStart = toDateOnly(startDate);
          const parsedEnd = toDateOnly(endDate);
          if (
            isNaN(rowDate.getTime()) ||
            rowDate < parsedStart ||
            rowDate > parsedEnd
          ) {
            isMatch = false;
          }
        }
      }

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

    const rowsWithSrNo = newFilteredRows?.map((row, index) => ({
      ...row,
      srNo: index + 1,
    }));

    if (masterKeyData?.GroupCheckBox == "True") {
      const groupedRows = groupRows(rowsWithSrNo, grupEnChekBox);
      setFilteredRows(groupedRows);
    } else {
      setFilteredRows(rowsWithSrNo);
    }
  }, [filters, commonSearch, startDate, columns, selectedDateColumn]);

  const handleFilterChange = (FieldName, value, filterType, HeaderName) => {
    setFilters((prevFilters) => {
      if (filterType === "MultiSelection") {
        const selectedValues = prevFilters[FieldName] || [];
        let newValues;

        if (value.checked) {
          newValues = [...selectedValues, value.value];
        } else {
          newValues = selectedValues.filter((v) => v !== value.value);
        }

        return {
          ...prevFilters,
          [FieldName]: newValues,
        };
      }
      return {
        ...prevFilters,
        [FieldName]: value,
      };
    });

    setFiltersShow((prevFilters) => {
      if (filterType === "MultiSelection") {
        const selectedValues = prevFilters?.[HeaderName] || [];

        const checked = value?.checked ?? false;
        const val = value?.value;

        if (val === undefined) {
          console.warn("Filter value is undefined for", HeaderName);
          return prevFilters;
        }

        const newValues = checked
          ? [...selectedValues, val]
          : selectedValues.filter((v) => v !== val);

        return {
          ...prevFilters,
          [HeaderName]: newValues,
        };
      }

      return {
        ...prevFilters,
        [HeaderName]: value,
      };
    });
  };

  const SERVER_SEP = "###";
  const serverFiltersRef = useRef({});
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
          style={{ width: "100%", margin: "10px 20px" }}
          key={col.headerNamesingle}
        >
          <TextField
            label={`Filter ${col.headerNamesingle}`}
            variant="outlined"
            style={{ width: "100%" }}
            className="customize_colum_input"
            InputProps={{
              style: { height: 36, fontSize: 16, width: "100%" },
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

  //
  const renderFilterMulti = (col) => {
    if (!col.filterTypes || col.filterTypes.length === 0) return null;
    const filtersToRender = col.filterTypes;
    return filtersToRender?.map((filterType) => {
      switch (filterType) {
        case "MultiSelection":
          const uniqueValues = [
            ...new Set(originalRows?.map((row) => row[col.field])),
          ];
          const headerName = col.headerNameSub;
          return (
            <div key={col.field} style={{ margin: "10px 20px" }}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<MdExpandMore />}
                  aria-controls={`${col.field}-content`}
                  id={`${col.field}-header`}
                  sx={{
                    "& .MuiButtonBase-root": {
                      display: "none",
                    },
                  }}
                >
                  <Typography>{col.headerNameSub}</Typography>
                </AccordionSummary>
                <AccordionDetails className="gridMetalComboMain">
                  {uniqueValues.map((value) => (
                    <label key={value}>
                      <input
                        type="checkbox"
                        value={value}
                        checked={(filters[col.field] || []).includes(value)}
                        onChange={(e) =>
                          handleFilterChange(
                            col.field,
                            { value, checked: e.target.checked },
                            "MultiSelection",
                            headerName
                          )
                        }
                      />
                      {value}
                    </label>
                  ))}
                </AccordionDetails>
              </Accordion>
            </div>
          );

        default:
          return null;
      }
    });
  };

  //
  const renderFilterRange = (col) => {
    if (!col.filterTypes || col.filterTypes.length === 0) return null;
    const filtersToRender = col.filterTypes;
    return filtersToRender.map((filterType) => {
      switch (filterType) {
        case "RangeFilter":
          return (
            <div
              key={`filter-${col.FieldName}-RangeFilter`}
              style={{ margin: "10px 20px", display: "flex", gap: "10px" }}
            >
              <TextField
                type="number"
                key={`filter-${col.headerNamesingle}-MinFilter`}
                name={`filter-${col.headerNamesingle}-MinFilter`}
                label={`${col.headerNamesingle} Min`}
                variant="outlined"
                value={filters[`${col.FieldName}_min`] || ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? parseFloat(e.target.value)
                    : "";
                  setFilters((prev) => ({
                    ...prev,
                    [`${col.FieldName}_min`]: value,
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
                value={filters[`${col.FieldName}_max`] || ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? parseFloat(e.target.value)
                    : "";
                  setFilters((prev) => ({
                    ...prev,
                    [`${col.FieldName}_max`]: value,
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

  //
  const renderFilterDropDown = (col) => {
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
              style={{ width: "100%", margin: "10px 20px" }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>{`Select ${col.headerNameSub}`}</InputLabel>
                <Select
                  label={`Select ${col.headerNameSub}`}
                  name={`Select ${col.headerNameSub}`}
                  value={filters[col.field] || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      col.field,
                      e.target.value,
                      "",
                      col.headerNameSub
                    )
                  }
                  style={{
                    height: 40, // input height
                    fontSize: 16, // font size
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>{`Select ${col?.headerNameSub}`}</em>
                  </MenuItem>
                  {uniqueValues.map((value) => (
                    <MenuItem
                      key={`select-${col.field}-${value}`}
                      value={value}
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

  //
  const renderFilter = (col) => {
    if (!col.filterTypes || col.filterTypes.length === 0) return null;
    const filtersToRender = col.filterTypes;
    return filtersToRender.map((filterType) => {
      switch (filterType) {
        case "NormalFilter":
          return (
            <div style={{ width: "100%", margin: "10px 20px" }}>
              <TextField
                key={`filter-${col.headerNamesingle}-NormalFilter`}
                name={`filter-${col.headerNamesingle}-NormalFilter`}
                label={`Enter ${col.headerNamesingle}`}
                variant="outlined"
                value={filters[col.FieldName] || ""}
                style={{ width: "100%" }}
                onChange={(e) =>
                  handleFilterChange(
                    col.FieldName,
                    e.target.value,
                    "",
                    col.headerNamesingle
                  )
                }
                className="customize_colum_input"
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

  //
  const [highlightedIndex, setHighlightedIndex] = useState({});
  const [suggestionVisibility, setSuggestionVisibility] = useState({});
  const suggestionRefs = useRef({});

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

  const renderSuggestionFilter = (col) => {
    if (!col.filterTypes || col.filterTypes.length === 0) return null;
    const filtersToRender = col.filterTypes;

    return filtersToRender.map((filterType) => {
      if (filterType !== "suggestionFilter") return null;
      const field = col.field;
      const headerName = col.headerNameSub;
      const inputValue = filters[field]?.toLowerCase() || "";
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
        handleFilterChange(field, value.trimStart(), "", headerName);
        setSuggestionVisibility((prev) => ({ ...prev, [field]: true }));
        setHighlightedIndex((prev) => ({ ...prev, [field]: 0 }));
      };

      const handleSelectSuggestion = (value) => {
        handleFilterChange(field, value, "", headerName);
        setSuggestionVisibility((prev) => ({ ...prev, [field]: false }));
        setHighlightedIndex((prev) => ({ ...prev, [field]: 0 }));
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

      return (
        <div
          key={`filter-${field}-suggestionFilter`}
          ref={refCallback}
          style={{ margin: "10px 20px", position: "relative", width: "100%" }}
        >
          <TextField
            key={`filter-${col.headerNameSub}`}
            name={`filter-${col.headerNameSub}`}
            label={`Enter ${col.headerNameSub}`}
            variant="outlined"
            value={filters[col.FieldName] || ""}
            style={{ width: "100%" }}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if ((filters[field] || "").trim().length > 0) {
                setSuggestionVisibility((prev) => ({ ...prev, [field]: true }));
              }
            }}
            onKeyDown={handleKeyDown}
            size="small"
            autoComplete="off"
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
          />
          {suggestionVisibility[field] && suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                maxHeight: "300px",
                overflowY: "auto",
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.1)",
                zIndex: 10,
                borderRadius: "4px",
              }}
            >
              {suggestions.map((value, index) => (
                <div
                  key={`suggestion-${field}-${value}`}
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

  const summaryColumns = columns?.filter((col) => {
    const columnData = Object?.values(allColumData)?.find(
      (data) => data?.FieldName === col?.field
    );
    return String(columnData?.Summary).toLowerCase() === "true";
  });

  const renderSummary = () => {
    return (
      <div
        className="summaryBox"
        style={{
          display: summaryColumns.length >= 3 ? "grid" : "flex",
          gridTemplateColumns:
            summaryColumns.length >= 3
              ? `repeat(${summaryColumns.length}, 1fr)`
              : "none",
          justifyContent: summaryColumns.length < 3 ? "flex-start" : "unset",
        }}
      >
        {summaryColumns.map((col) => {
          let calculatedValue =
            filteredRows?.reduce(
              (sum, row) => sum + (parseFloat(row[col.field]) || 0),
              0
            ) || 0;

          return (
            <div
              key={col.field}
              className={
                summaryColumns.length >= 3
                  ? "AllEmploe_boxViewTotal_big"
                  : "AllEmploe_boxViewTotal"
              }
            >
              <div>
                <p className="AllEmplo_boxViewTotalValue">
                  {col?.SummaryValueFormated == 1
                    ? Number(calculatedValue).toLocaleString("en-IN", {
                        minimumFractionDigits: col?.SummaryValueKey,
                        maximumFractionDigits: col?.SummaryValueKey,
                      })
                    : calculatedValue.toFixed(
                        Number(col?.SummaryValueKey)
                      )}{" "}
                  <span style={{ fontSize: "17px" }}>{col?.SummaryUnit}</span>
                </p>
                <p className="boxViewTotalTitle">
                  {col.SummaryTitle == null
                    ? col?.headerNameSub
                    : col.SummaryTitle}
                </p>
              </div>
              {/* <div style={{ display: "flex" }}>
                {col?.IconName && (
                  <IconButton
                    sx={{
                      background: "#e8f5e9",
                      color: "#2e7d32",
                      height: "42px",
                      width: "42px",
                      transition: "all .2s ease",
                      "&:hover": {
                        backgroundColor: "#c8e6c9",
                        transform: "translateY(-2px)",
                      },
                      cursor: "text",
                    }}
                    size="medium"
                  >
                    <DynamicIcon name={col?.IconName} size={32} color="green" />
                  </IconButton>
                )}
              </div> */}
            </div>
          );
        })}
      </div>
    );
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (gridContainerRef.current.requestFullscreen) {
        gridContainerRef.current.requestFullscreen();
      } else if (gridContainerRef.current.mozRequestFullScreen) {
        gridContainerRef.current.mozRequestFullScreen();
      } else if (gridContainerRef.current.webkitRequestFullscreen) {
        gridContainerRef.current.webkitRequestFullscreen();
      } else if (gridContainerRef.current.msRequestFullscreen) {
        gridContainerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  function mapRowsToHeaders(columns, rows) {
    const isIsoDateTime = (str) =>
      typeof str === "string" && /^\d{4}-\d{2}-\d{2}T/.test(str);

    const fieldToHeader = {};
    columns?.forEach((col) => {
      let header = "";

      if (typeof col.headerName === "string") {
        header = col.headerName;
      } else if (col.headerNamesingle) {
        header = col.headerNamesingle;
      } else if (
        col.headerName?.props?.children &&
        Array.isArray(col.headerName.props.children)
      ) {
        header = col.headerName.props.children[1];
      }

      if (!header && col.field === "sr") {
        header = "Sr#"; // fallback header
      }

      fieldToHeader[col.field] = header;
    });

    return rows?.map((row, idx) => {
      const ordered = {};
      columns?.forEach((col) => {
        const header = fieldToHeader[col.field];
        let value = row[col.field] ?? "";

        if (col.field === "sr") value = idx + 1;
        else if (col.field === "Venderfgage") {
          const fgDateStr = row.fgdate;
          const outsourceDateStr = row.outsourcedate;
          let finalDate = 0;
          if (fgDateStr && outsourceDateStr) {
            const diff =
              new Date(fgDateStr).getTime() -
              new Date(outsourceDateStr).getTime();
            finalDate = Math.floor(diff / (1000 * 60 * 60 * 24));
          }
          value = finalDate;
        } else if (col.field === "Fgage") {
          const fgDateStr = row.fgdate;
          const orderDateStr = row.orderdate;
          let finalDate = 0;
          if (fgDateStr && orderDateStr) {
            const diff =
              new Date(fgDateStr).getTime() - new Date(orderDateStr).getTime();
            finalDate = Math.floor(diff / (1000 * 60 * 60 * 24));
          }
          value = finalDate;
        }

        if (isIsoDateTime(value)) {
          const dateObj = new Date(value);
          const day = String(dateObj.getDate()).padStart(2, "0");
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const year = dateObj.getFullYear();
          value = `${day}-${month}-${year}`;
        }

        ordered[header] = value;
      });

      return ordered;
    });
  }

  const converted = mapRowsToHeaders(columns, filteredRows);
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(converted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: EXCEL_TYPE });
    const now = new Date();
    const dateString = now
      .toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/[/:]/g, "-")
      .replace(/, /g, "_");
    const fileName = `${reportName}_${dateString}.xlsx`;
    saveAs(data, fileName);
  };

  const handleClearFilter = () => {
    setCommonSearch("");
    setFiltersShow();
    setFilters({});
    setFilteredValue();
  };

  const handlePaginationChange = (newModel) => {
    setIsPageChanging(true);
    setPaginationModel(newModel);
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

  const handleColorClick = (id) => {
    setSelectedColors((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
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

  const handleSaveAction = async () => {
    if (!selectionModel || selectionModel.length === 0) {
      alert("Please select at least one row first.");
      return;
    }
    if (!tempValue) return;

    // Format value
    let newValue = tempValue;
    if (
      activeActionColumn?.DateColumn === "True" ||
      activeActionColumn?.DateColumn === true
    ) {
      newValue = dayjs(tempValue, "DD-MMM-YYYY").format("MMM DD YYYY 12:00A");
    }

    const actionIds = selectionModel.join("###");
    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
    const body = {
      con: JSON.stringify({
        id: "",
        mode: "SetAction",
        appuserid: AllData?.LUId,
      }),
      p: JSON.stringify({
        ReportId: String(activeActionColumn.ReportId),
        ActionIds: actionIds,
        ColId: String(activeActionColumn.ColId),
        NewValue: newValue,
        ColName: activeActionColumn.FieldName,
      }),
      f: "DynamicReport ( get sp list )",
    };

    try {
      const response = await ReportCallApi(body, spNumber);
      setFilteredRows((prev) =>
        prev.map((row) =>
          selectionModel.includes(row.id)
            ? {
                ...row,
                [activeActionColumn.FieldName]:
                  activeActionColumn?.DateColumn === "True" ||
                  activeActionColumn?.DateColumn === true
                    ? dayjs(newValue, "MMM DD YYYY hh:mma").toISOString()
                    : newValue,
              }
            : row
        )
      );
      setActiveActionColumn(null);
      setTempValue("");
    } catch (error) {
      console.error("Error updating action:", error);
      alert("Something went wrong while updating.");
    }
  };

  const handleAllDataShow = () => {
    setIsPageChanging(true);
    setTimeout(() => {
      setIsPageChanging(false);
    }, 400);
    const allStart = new Date("1990-01-01T18:30:00.000Z");
    const allEnd = new Date();
    setFilterState((prev) => ({
      ...prev,
      dateRange: { startDate: allStart, endDate: allEnd },
    }));
    const pickerInput = document.querySelector(
      'input[aria-label="Date Range"]'
    );
    if (pickerInput) pickerInput.value = "";
    setCommonSearch("");
    setSelectedDateColumn();
    setFiltersShow();
    setFilters({});
    setFilteredValue();
    if (!showReportMaster) {
      filteredValueState != 0 && onSearchFilter?.({}, "2");
    }
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

      // DefaultSort column
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
  const handleOpenPrintPreview = () => {
    const sorted = getSortedRows(); // now sorted same as image view
    setPrintData(sorted);
    setShowPrintView(true);
  };

  const handlePrintNow = () => {
    window.print();
    setShowPrintView(false); // hide preview after print
  };

  const [open, setOpen] = useState(false);

  const url =
    "http://nzen/R50B3/salescrm/app/ProductInfoRemarks?entrydate=11/19/2025%2010:02:57%20AM&jobno=288461&versionname=&QuotationNo=QT/00069621&-=ODM1MjAyNTExMTkwOTM2MjQ5NDcjIyN7e256ZW59fXt7MjB9fXt7b3JhaWwyNX19e3tvcmFpbDI1fX0=-v/gVApszMU4=";

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
            marginTop: "20px",
            paddingTop: "10px",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handlePrintNow}
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
        <Print1JewelleryBook visibleItemsMain={printData} />
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

          <Dialog open={openPopup} onClose={() => setOpenPopup(false)}>
            <IconButton
              style={{ position: "absolute", top: 0, right: 5 }}
              onClick={() => setOpenPopup(false)}
            >
              <CircleX />
            </IconButton>
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
                      {allColumData.map((col, index) => (
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
          >
            <div
              style={{
                margin: "20px 10px 0px 10px",
                fontSize: "25px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                onClick={handleClearFilter}
                className="btn_ClearFilterButton"
              >
                <MdOutlineFilterAltOff style={{ fontSize: "25px" }} />
                Clear
              </button>

              <CircleX
                style={{
                  cursor: "pointer",
                  height: "30px",
                  width: "30px",
                }}
                onClick={() => setSideFilterOpen(false)}
              />
            </div>

            {columnsHide
              .filter((col) => col.filterable)
              .map((col) => (
                <div
                  key={col.FieldName}
                  style={{ display: "flex", gap: "10px" }}
                >
                  {renderServerSideFilter(col)}
                </div>
              ))}

            {columnsHide
              .filter((col) => col.filterable)
              .map((col) => (
                <div key={col.FieldName}>
                  {col.filterTypes?.includes("MultiSelection") &&
                    renderFilterMulti(col)}
                </div>
              ))}

            {columnsHide
              .filter((col) => col.filterable)
              .map((col) => (
                <div key={col.FieldName}>{renderFilterRange(col)}</div>
              ))}

            {columnsHide
              .filter((col) => col.filterable)
              .map((col) => (
                <div
                  key={col.FieldName}
                  style={{ display: "flex", gap: "10px" }}
                >
                  {renderFilterDropDown(col)}
                </div>
              ))}

            {columnsHide
              .filter((col) => col.filterable)
              .map((col) => (
                <div
                  key={col.FieldName}
                  style={{ display: "flex", gap: "10px" }}
                >
                  {renderFilter(col)}
                </div>
              ))}

            {columnsHide
              .filter((col) => col.filterable)
              .map((col) => (
                <div
                  key={col.FieldName}
                  style={{ display: "flex", gap: "10px" }}
                >
                  {renderSuggestionFilter(col)}
                </div>
              ))}
          </Drawer>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog
              open={Boolean(activeActionColumn)}
              onClose={() => setActiveActionColumn(null)}
              maxWidth="xs"
              fullWidth
            >
              <div style={{ height: "400px" }}>
                <DialogTitle>
                  {activeActionColumn
                    ? `Update ${activeActionColumn.HeaderName}`
                    : ""}
                </DialogTitle>

                <DialogContent dividers>
                  {activeActionColumn?.DateColumn == "True" ? (
                    <DatePicker
                      label="Select Date"
                      value={tempValue ? dayjs(tempValue, "DD-MMM-YYYY") : null}
                      onChange={(newValue) => {
                        if (newValue) {
                          const formatted = newValue.format("DD-MMM-YYYY");
                          setTempValue(formatted);
                        } else {
                          setTempValue("");
                        }
                      }}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  ) : activeActionColumn?.actionMasterName ? (
                    <TextField
                      select
                      fullWidth
                      label={`Select ${activeActionColumn.HeaderName}`}
                      value={tempValue || ""}
                      onChange={(e) => setTempValue(e.target.value)}
                    >
                      {/* {masterData[activeActionColumn.actionMasterName]?.map(
                    (item) => (
                      <MenuItem
                        key={item.id}
                        value={item.userJob || item.amount}
                      >
                        {item.userJob || item.amount}
                      </MenuItem>
                    )
                  )} */}
                    </TextField>
                  ) : (
                    <TextField
                      fullWidth
                      label={`Enter ${activeActionColumn?.HeaderName}`}
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                    />
                  )}
                </DialogContent>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "end",
                    height: "55%",
                  }}
                >
                  <Button onClick={() => setActiveActionColumn(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSaveAction}
                    style={{ backgroundColor: "#7367f0" }}
                  >
                    Save
                  </Button>
                </div>
              </div>
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
                <Tooltip title="Column Rearrange">
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
                  >
                    <AiFillSetting size={22} />
                  </IconButton>
                </Tooltip>
                // <div className="fullScreenButton  " onClick={handleClickOpenPoup}>
                //   <AiFillSetting style={{ height: "25px", width: "25px" }} />
                // </div>
              )}
            </div>
          </div>
          <div>{renderSummary()}</div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "5px 10px",
            }}
          >
            <div style={{ display: "flex", gap: "10px", alignItems: "end" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Button
                  onClick={toggleDrawer(true)}
                  className="btn_FiletrBtnOpen"
                >
                  <MdOutlineFilterAlt
                    style={{ height: "30px", width: "30px" }}
                  />
                </Button>

                {spliterReportShow != true &&
                  masterKeyData?.MainDateFilter == "True" &&
                  (masterKeyData?.MultiDateFilter == "True" ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <FormControl
                        size="small"
                        sx={{ minWidth: 150, margin: "0px" }}
                      >
                        <InputLabel>Date Type</InputLabel>
                        <Select
                          label="Date Type"
                          value={selectedDateColumn}
                          onChange={(e) =>
                            setSelectedDateColumn(e.target.value)
                          }
                          style={{
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                          }}
                          sx={{
                            "& .MuiSelect-select": {
                              padding: "7px !important",
                            },
                          }}
                        >
                          {dateColumnOptions.map((col) => (
                            <MenuItem key={col.field} value={col.field}>
                              {col.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <DualDatePicker
                        filterState={filterState}
                        setFilterState={setFilterState}
                        validDay={186}
                        validMonth={6}
                        withountDateFilter={true}
                        hideDisplay={
                          filterState.dateRange.startDate?.getFullYear?.() ===
                          1990
                        }
                      />
                    </div>
                  ) : (
                    <DualDatePicker
                      filterState={filterState}
                      setFilterState={setFilterState}
                      validDay={186}
                      validMonth={6}
                      withountDateFilter={true}
                      hideDisplay={
                        filterState.dateRange.startDate?.getFullYear?.() ===
                        1990
                      }
                    />
                  ))}

                {spliterReportShow != true &&
                  masterKeyData?.AllDataButton == "True" && (
                    <Button
                      onClick={handleAllDataShow}
                      className="btn_FiletrBtnAll"
                    >
                      All
                    </Button>
                  )}
              </div>

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
                  width: "250px",
                  "& .MuiInputBase-input": {
                    padding: "6px 8px !important",
                  },
                }}
                className="txt_commonSearch"
              />

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
                        Set {col.HeaderName}
                      </Button>
                    ) : null
                  )}
              </div>
              {masterKeyData?.PriorityMaster == "True" && (
                <div style={{ display: "flex", gap: "10px" }}>
                  {!isLoading &&
                    colorMaster?.map((data, index) => {
                      const isSelected = selectedColors.includes(data.id);

                      return (
                        <Tooltip title={data.code} key={index}>
                          <div
                            onClick={() => handleColorClick(data.id)}
                            style={{
                              backgroundColor: data.colorcode,
                              height: isSelected ? "28px" : "30px",
                              width: isSelected ? "28px" : "30px",
                              cursor: "pointer",
                              border: isSelected
                                ? "2px solid black"
                                : "1px solid #ccc",
                              boxShadow: isSelected ? "0 0 5px #000" : "none",
                            }}
                          ></div>
                        </Tooltip>
                      );
                    })}
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "end", gap: "10px" }}>
              {/* {masterKeyData?.MailButton == "True" && (
              <img
                src={mainButton}
                style={{ cursor: "pointer" }}
                onClick={handleSendEmail}
              />
            )} */}

              {masterKeyData?.PrintButton == "True" && (
                <Tooltip title="Print">
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
                        <Tooltip title="Report View">
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
                        <Tooltip title="Image View">
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
                      <Tooltip title="Report View">
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
                      <Tooltip title="Image View">
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

              {masterKeyData?.ExcelExport && (
                <Tooltip title="Export to Excel">
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

              {masterKeyData?.FullScreenGridButton == "True" && (
                <Tooltip title="Full Screen Report">
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

                // <button className="fullScreenButton" onClick={toggleFullScreen}>
                //   <RiFullscreenLine
                //     style={{ marginInline: "5px", fontSize: "30px" }}
                //   />
                // </button>
              )}
            </div>
            {/* <Button onClick={() => setOpen(true)}>Open iframe</Button> */}
          </div>

          <div
            ref={gridRef}
            style={{
              height: showImageView
                ? "70vh"
                : summaryColumns?.length == 0
                ? masterKeyData?.ColumnSettingModel == "True"
                  ? "calc(100vh - 190px)"
                  : "calc(100vh - 130px)"
                : "calc(100vh - 255px)",
              margin: "5px 10px",
              overflow: "auto",
              transition: "opacity 0.3s",
              opacity: isPageChanging ? 0.5 : 1,
            }}
            className="dataGrid_Warper"
          >
            {showImageView ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {[...filteredRows]
                  .sort((a, b) => {
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
                    const order =
                      col.DefaultSort.toLowerCase() === "ascending" ? 1 : -1;
                    const x = a[field];
                    const y = b[field];

                    if (!isNaN(x) && !isNaN(y)) {
                      return (Number(x) - Number(y)) * order;
                    }
                    return String(x).localeCompare(String(y)) * order;
                  })
                  .map((item, idx) => {
                    const defaultImg = noFoundImg;
                    const src = String(item?.ImgUrl ?? "").trim() || defaultImg;
                    return (
                      <div
                        key={idx}
                        style={{
                          width: 200,
                          height: 230,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <img
                          src={src}
                          alt={`record-${idx}`}
                          loading="lazy"
                          onError={(e) => {
                            if (e.target.src !== defaultImg)
                              e.target.src = defaultImg;
                          }}
                          style={{
                            width: "200px",
                            height: "200px",
                            border: "1px solid lightgray",
                            objectFit: "cover",
                            borderRadius: "4px",
                            backgroundColor: "#f9f9f9",
                          }}
                        />

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "4px",
                          }}
                        >
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "13px",
                                lineHeight: "16px",
                              }}
                            >
                              {item?.designcount !== undefined && (
                                <span>
                                  Order: <strong>{item.designcount}</strong>
                                </span>
                              )}
                              {item?.designcount !== undefined &&
                                item?.salescount !== undefined &&
                                ", "}
                              {item?.salescount !== undefined && (
                                <span>
                                  Sale: <strong>{item.salescount}</strong>
                                </span>
                              )}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: "10px" }}>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 600,
                                fontSize: "12px",
                                lineHeight: "10px",
                              }}
                            >
                              <span>{item?.StockBarcode}</span>
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 600,
                                fontSize: "12px",
                                color: "#CF4F7D",
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: "3px",
                                  lineHeight: "10px",
                                }}
                              >
                                <span>{item?.metaltype}</span>
                                <span>{item?.metalpurity}</span>
                              </div>
                              <span>{item?.metalcolor}</span>
                            </p>
                          </div>

                          <p
                            style={{
                              margin: 0,
                              fontWeight: 600,
                              fontSize: "13px",
                              lineHeight: "10px",
                            }}
                          >
                            {item?.designno}
                          </p>
                        </div>
                      </div>
                    );
                  })}
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
                  // onSortModelChange={(model) => setSortModel(model)}
                  onSortModelChange={(model) => {
                    if (model.length === 0 && initialSort.current) return;
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

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            height: "90%",
            bgcolor: "white",
            boxShadow: 24,
            p: 0,
          }}
        >
          <iframe
            src={url}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Product Info"
          ></iframe>
        </Box>
      </Modal>

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
    </DragDropContext>
  );
}