import {
  alpha,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { MdOutlineFilterAlt } from "react-icons/md";
import DualDatePicker from "../../../../Utils/DatePicker/DualDatePicker";
import { FileSpreadsheet, Image, LayoutGrid, Pencil, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { RiFullscreenLine } from "react-icons/ri";
import { FaPrint } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import CustomDualDatePicker from "../../../../Utils/CustomDualDatePicker/CustomDualDatePicker";

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
  apiRef
}) => {
  const [searchParams] = useSearchParams();
  const pid = searchParams.get("pid");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clearDateFilter, setClearDateFilter] = useState({
    startDate: "",
    endDate: "",
    status: "",
  });

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
    setFiltersShow({});
    setFilters({});
    setDraftFilters({});
    setFilteredValue([]);
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
      const isUsedAsTwoColumn = twoColumnFields.has(field);
      const isImageColumn =
        col.ImageColumn === "True" ||
        field === "ImgUrl" ||
        field === "ImageUrl" ||
        field === "FileName";

      // ❌ Skip image columns completely
      if (isImageColumn) return;

      if (isHidden && !isUsedAsTwoColumn) return;

      exportColumns.push({ ...col, field });

      if (isValidTwoColumn(col.TwoColumnData)) {
        const twoCol = columnMap[col.TwoColumnData];

        if (twoCol) {
          const twoField = twoCol.FieldName || twoCol.field;

          // ❌ Skip image column even if it comes via TwoColumnData
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

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "5px 10px",
      }}
    >
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
      <div style={{ display: "flex", alignItems: "end", gap: "10px" }}>
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
  );
};

export default ReportTopFilterEndAction;