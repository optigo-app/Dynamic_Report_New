import { Button, Dialog, IconButton, Tooltip, Box, Typography, Grid, Card } from "@mui/material";
import { ArrowLeft, CircleArrowRight, CircleChevronLeft, CircleChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { AiFillSetting } from "react-icons/ai";
import ColumnRearrange from "../../ColumnRearrange/ColumnRearrange";
import { AiOutlineSetting } from "react-icons/ai"; // Swapped to Outline for a cleaner modern look


const SummaryEndFilteredValue = ({
  setSummaryColumns,
  setFinalSummaryColumns,
  columnsHide,
  allColumData,
  filteredRows,
  showReportMaster,
  onBack,
  filteredValueState,
  masterKeyData,
  gridContainerRef,
  reportName,
  setAllColumData,
  tempColumns,
  setTempColumns,
  currentOpenReport,
  otherReport,
  setOtherReprot
}) => {

  const [openPopup, setOpenPopup] = useState(false);
  useEffect(() => {
    if (openPopup) {
      setTempColumns(JSON.parse(JSON.stringify(allColumData)));
    }
  }, [openPopup, allColumData]);

  const handleClickOpenPoup = () => {
    setOpenPopup(true);
  };

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

  useEffect(() => {
    const finalSummaryColumnsC = [
      ...summaryColumns,
      ...unicSummaryColumns,
    ];

    setSummaryColumns(summaryColumns);
    setFinalSummaryColumns(finalSummaryColumnsC);
  }, [columnsHide, allColumData, filteredRows]);

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


    return <>
      <Box sx={{ padding: { xs: "8px", sm: "12px" }, width: "100%", boxSizing: "border-box" }}>
        <Grid container spacing={1}
        rowSpacing={2.5}
        alignItems="stretch">
          {sortedSummaryColumns.map((col) => {
            // -------------------------------------------------------------
            // LOGIC REMAINS EXACTLY THE SAME - NO FUNCTIONALITY TOUCHED
            // -------------------------------------------------------------
            const columnMeta = Object.values(allColumData)?.find(
              (data) => data.FieldName === col.field
            );
            const isUniq = String(columnMeta?.IsUniqueCount).toLowerCase() === "true";

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
            // -------------------------------------------------------------

            return (
              <Grid
                item
                xs={6}
                sm={4}
                md={3}
                lg={1.5}
                key={col.field}
                sx={{ display: "flex" }}
              >
                <Card
                  elevation={0}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between", // Pushes title up, value down
                    width: "100%",
                    height: "100%",
                    padding: "6px 12px", // Compact padding matching the image
                    borderRadius: "8px", // Slightly sharper, modern corners
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB", // Very crisp, subtle border
                    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.02)", // Barely visible flat shadow
                    transition: "border-color 0.2s ease",
                    "&:hover": {
                      borderColor: "#D1D5DB", // Just a slight border darkening on hover
                    },
                  }}
                >
                  {/* TOP: Title / Subtitle */}
                 <Box
                 sx={{
                  display:'flex',
                  alignItems:'center',
                  gap:'8px',
                  justifyContent:'space-between',
                  width:'100%'
                 }}
                 >
                   <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6B7280", // Light gray
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={
                      columnMeta?.SummaryTitle == null || columnMeta?.SummaryTitle === ""
                        ? col?.headerNameSub
                        : columnMeta?.SummaryTitle
                    }
                  >
                    {columnMeta?.SummaryTitle == null || columnMeta?.SummaryTitle === ""
                      ? col?.headerNameSub
                      : columnMeta?.SummaryTitle}
                  </Typography>
                  {/* <KpiCardLogo/> */}
                 </Box>
                  <Box sx={{ display: "flex" }}>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: "2px", maxWidth: "100%" }}>
                      <Typography
                        sx={{
                          fontSize: "clamp(18px, 2vw, 22px)",
                          fontWeight: 500,
                          color: "#111827",
                          lineHeight: 1,
                          letterSpacing: "-0.5px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {isUniq
                          ? calculatedValue
                          : col?.SummaryValueFormated == 1
                            ? Number(calculatedValue).toLocaleString("en-IN", {
                              minimumFractionDigits: col?.SummaryValueKey,
                              maximumFractionDigits: col?.SummaryValueKey,
                            })
                            : calculatedValue.toFixed(Number(col?.SummaryValueKey))}
                      </Typography>

                      {col?.SummaryUnit && (
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "clamp(12px, 1.2vw, 14px)",
                            fontWeight: 500,
                            color: "#6B7280",
                            marginLeft: "2px"
                          }}
                        >
                          {col?.SummaryUnit}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </>

    return <>
      <Box sx={{ padding: "16px", width: "100%", boxSizing: "border-box" }}>
        <Grid container spacing={2}>
          {sortedSummaryColumns.map((col) => {
            const columnMeta = Object.values(allColumData)?.find(
              (data) => data.FieldName === col.field
            );
            const isUniq = String(columnMeta?.IsUniqueCount).toLowerCase() === "true";

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
              <Grid
                item
                xs={6}
                sm={4}
                md={3}
                lg={1.5}
                key={col.field}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "14px",
                    borderRadius: "16px",
                    background: "linear-gradient(301deg, #F4F7FE 0%, #FFFFFF 100%)",
                    border: "1px solid",
                    borderColor: "#E2E8F0",
                    boxShadow: "0px 4px 12px rgba(112, 144, 176, 0.08)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: "4px", mb: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "#2B3674",
                        lineHeight: 1.2,
                        letterSpacing: "-0.5px"
                      }}
                    >
                      {isUniq
                        ? calculatedValue
                        : col?.SummaryValueFormated == 1
                          ? Number(calculatedValue).toLocaleString("en-IN", {
                            minimumFractionDigits: col?.SummaryValueKey,
                            maximumFractionDigits: col?.SummaryValueKey,
                          })
                          : calculatedValue.toFixed(Number(col?.SummaryValueKey))}
                    </Typography>

                    {col?.SummaryUnit && (
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#4318FF",
                        }}
                      >
                        {col?.SummaryUnit}
                      </Typography>
                    )}
                  </Box>

                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#A3AED0",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={
                      columnMeta?.SummaryTitle == null || columnMeta?.SummaryTitle == ""
                        ? col?.headerNameSub
                        : columnMeta?.SummaryTitle
                    }
                  >
                    {columnMeta?.SummaryTitle == null || columnMeta?.SummaryTitle == ""
                      ? col?.headerNameSub
                      : columnMeta?.SummaryTitle}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </>
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

  const containerRef = useRef(null);
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setShowScroll(el.scrollWidth > el.clientWidth);
  }, [filteredValueState]);

  const scroll = (dir) => {
    containerRef.current.scrollBy({
      left: dir === "left" ? -150 : 150,
      behavior: "smooth",
    });
  };
  return (
    <>
      <Dialog
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        disablePortal
        sx={{
          borderRadius: '20px'
        }}
      >
        <ColumnRearrange
          setOpenPopup={setOpenPopup}
          tempColumns={tempColumns}
          setAllColumData={setAllColumData}
          reportName={reportName}
          allColumData={allColumData}
          currentOpenReport={currentOpenReport}
          otherReport={otherReport}
          setOtherReprot={setOtherReprot}
        />
      </Dialog>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          gap: 2,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1, minWidth: 0 }}>
          {showReportMaster && (
            <Tooltip title="Go Back">
              <IconButton
                onClick={onBack}
                size="small"
                sx={{
                  border: "1px solid",
                  borderColor: "#E4E4E7",
                  borderRadius: "10px",
                  color: "#52525B",
                  width: "40px",
                  height: "40px",
                  bgcolor: "#FAFAFA",
                  "&:hover": { bgcolor: "#F4F4F5", color: "#18181B" },
                }}
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
              </IconButton>
            </Tooltip>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              minWidth: 0,
              height: "40px",
            }}
          >
            {showScroll && (
              <IconButton
                onClick={() => scroll("left")}
                size="small"
                sx={{ color: "#A1A1AA", mr: 0.5, "&:hover": { color: "#18181B", bgcolor: "#F4F4F5" } }}
              >
                <CircleChevronLeft size={20} />
              </IconButton>
            )}

            <Box
              ref={containerRef}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                width: "100%",
                overflowX: "auto",
                whiteSpace: "nowrap",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {filteredValueState && filteredValueState.length > 0 ? (
                filteredValueState.map((data, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      bgcolor: "#F4F4F5",
                      borderRadius: "999px",
                      px: 1.5,
                      py: 0.5,
                      border: "1px solid",
                      borderColor: "rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 500, color: "#71717A", fontSize: "13px", letterSpacing: "-0.01em" }}
                    >
                      {data.name}
                    </Typography>

                    {/* Modern tiny separator dot */}
                    <Box sx={{ width: "3px", height: "3px", borderRadius: "50%", bgcolor: "#D4D4D8" }} />

                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "#18181B", fontSize: "13px", letterSpacing: "-0.01em" }}
                    >
                      {Array.isArray(data.value) ? data.value.join(", ") : data.value}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#A1A1AA",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  No filters applied
                </Typography>
              )}
            </Box>

            {showScroll && (
              <IconButton
                onClick={() => scroll("right")}
                size="small"
                sx={{ color: "#A1A1AA", ml: 0.5, "&:hover": { color: "#18181B", bgcolor: "#F4F4F5" } }}
              >
                <CircleChevronRight size={20} />
              </IconButton>
            )}
          </Box>
        </Box>
        <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          {masterKeyData?.ColumnSettingModel === "True" && (
            <Tooltip title="Column Rearrange" disablePortal PopperProps={{ container: gridContainerRef.current }}>
              <IconButton
                onClick={handleClickOpenPoup}
                sx={{
                  background: "#cdd5ff",
                  color: "#6f53ff",
                  height: "38px",
                  width: "38px",
                  borderRadius: 3,
                  transition: "all .2s ease",
                  "&:hover": {
                    backgroundColor: "#cdd5ff",
                  },
                }}
              >
                <AiOutlineSetting size={20} strokeWidth={10} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <div>{renderSummary()}</div>
    </>
  );


  return <>
    {/* Old code replce */}
    <div
      style={{
        display: "flex",
        padding: "5px 10px 0px 10px",
        justifyContent: 'space-between',
        gap: '20px'
      }}
    >
      <div style={{ display: "flex", gap: "15px", width: '96.5%' }}>
        {showReportMaster && (
          <Button
            variant="outlined"
            onClick={onBack}
            className="Btn_BackErrow"
          >
            <ArrowLeft color="#7367f0b3" />
          </Button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: 'lavender', borderRadius: '10px', width: '100%', height: '42px', padding: '0px 5px' }}>
          {showScroll && (
            <Button onClick={() => scroll("left")}
              style={{ minWidth: '20px', borderRadius: '50px' }}>
              <CircleChevronLeft style={{ color: '#6f53ff' }} />
            </Button>
          )}

          <div
            ref={containerRef}
            style={{
              display: "flex",
              gap: "10px",
              width: "100%",
              overflowX: "auto",
              whiteSpace: "nowrap",
              scrollbarWidth: "none",
            }}
          >
            {filteredValueState?.length !== 0 && filteredValueState?.length !== undefined ?
              filteredValueState?.map((data, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    flexShrink: 0,
                  }}
                >
                  <p className="FilterValue_title">{data.name} :</p>
                  <p className="FilterValue_Value">
                    {Array.isArray(data.value) ? data.value.join(", ") : data.value}
                    {i !== filteredValueState.length - 1 ? "," : ""}
                  </p>
                </div>
              ))
              :
              <div>
                <p style={{
                  fontSize: '14px',
                  color: '#949393',
                  padding: '0px 0px 0px 10px',
                  fontStyle: 'italic'
                }}>No Filter Apply</p>
              </div>
            }

          </div>

          {showScroll && (
            <Button onClick={() => scroll("right")}
              style={{ minWidth: '20px', borderRadius: '50px' }}>
              <CircleChevronRight style={{ color: '#6f53ff' }} />
            </Button>
          )}
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

  </>
};

export default SummaryEndFilteredValue;






const KpiCardLogo = () => {
  return <>
    <svg xmlns="http://www.w3.org/2000/svg" width={23} height={23} viewBox="0 0 24 24"><g fill="none" stroke="#7e08de" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}><path d="M10.546 2.437a1.957 1.957 0 0 0 2.908 0l.94-1.041a1.959 1.959 0 0 1 3.411 1.413l-.072 1.4a1.96 1.96 0 0 0 2.057 2.057l1.4-.071a1.959 1.959 0 0 1 1.41 3.41l-1.042.941a1.96 1.96 0 0 0 0 2.908l1.042.94a1.96 1.96 0 0 1-1.413 3.411l-1.4-.072a1.96 1.96 0 0 0-2.057 2.056l.072 1.4a1.96 1.96 0 0 1-3.408 1.411l-.94-1.041a1.96 1.96 0 0 0-2.908 0l-.94 1.041A1.958 1.958 0 0 1 6.2 21.191l.072-1.4a1.96 1.96 0 0 0-2.062-2.058l-1.4.072a1.96 1.96 0 0 1-1.41-3.411l1.042-.94a1.96 1.96 0 0 0 0-2.908L1.4 9.605A1.959 1.959 0 0 1 2.809 6.2l1.4.071A1.96 1.96 0 0 0 6.267 4.21L6.2 2.809A1.959 1.959 0 0 1 9.606 1.4z"></path><path d="m6 14.85l1.516-2.7l3.137 2.282l2.561-3.91l2.384 2.228L18 9"></path></g></svg>
  </>
}