import { Button, IconButton, Tooltip } from "@mui/material";
import { ArrowLeft, CircleArrowRight, CircleChevronLeft, CircleChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { AiFillSetting } from "react-icons/ai";

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
  setOpenPopup,
  selectedGroups,
  setDraftFilters,
  setFiltersShowDraf,
  setFilteredValue
}) => {

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
    <div>
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
                      {data.value}
                      {i !== filteredValueState.length - 1 && ","}
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
      <div>{renderSummary()}</div>
    </div>
  );
};

export default SummaryEndFilteredValue;