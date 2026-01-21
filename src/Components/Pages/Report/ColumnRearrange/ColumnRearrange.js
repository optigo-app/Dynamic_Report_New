import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CallApi } from "../../../../API/CallApi/CallApi";
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Snackbar,
} from "@mui/material";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { GripHorizontal } from "lucide-react";

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
            borderRadius: '20px'
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

const ColumnRearrange = ({
  setOpenPopup,
  tempColumns,
  setAllColumData,
  reportName,
  allColumData,
}) => {
  const [searchParams] = useSearchParams();
  const pid = searchParams.get("pid");
  const clientIpAddress = sessionStorage.getItem("clientIpAddress");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [checkedColumns, setCheckedColumns] = useState({});
  const [columSaveLoding, setColumSaveLoding] = useState(false);

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

  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const handleSaveSettings = async () => {
    setColumSaveLoding(true);
    try {
      let reportId = null;
      const keyPrefix = `${pid}_`;
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(keyPrefix)) {
          reportId = key.split("_")[1];
          break;
        }
      }
      if (!reportId) {
        console.warn("No ReportId found for pid:", pid);
        return;
      }
      const updatedData = tempColumns.map((col, index) => ({
        ...col,
        IsVisible: checkedColumns[col.FieldName] ? "True" : "False",
        DisplayOrder: index + 1,
      }));

      const columnsPayload = updatedData.map((col) => ({
        ColId: Number(col.ColId),
        IsVisible: col.IsVisible,
        DisplayOrder: col.DisplayOrder,
      }));

      const AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

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
        f: "DynamicReport (update display order)",
      };
      const response = await CallApi(body);
      if (response?.rd?.[0]?.stat === 1) {
        setAllColumData(updatedData);
        sessionStorage.setItem(
          `savedColumns_${reportName}`,
          JSON.stringify(updatedData)
        );
        setOpenSnackbar(true);
      } else {
        console.warn("Failed to update:", response?.stat_msg);
      }
    } catch (error) {
      console.error("handleSaveSettings error:", error);
    } finally {
      setColumSaveLoding(false);
    }
  };

  const handleCheckboxChange = useCallback((field) => {
    setCheckedColumns((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

  return (
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
              {tempColumns
                .filter((col) => col.HideColumn !== "True")
                .map((col, index) => (
                  <DraggableColumn
                    key={col.FieldName}
                    col={col}
                    index={index}
                    checkedColumns={checkedColumns}
                    handleCheckboxChange={handleCheckboxChange}
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

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
          Column Rearrange Successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ColumnRearrange;
