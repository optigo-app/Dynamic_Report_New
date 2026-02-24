import { Box, Button, Dialog, DialogActions, Menu, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import { CallApi } from '../../../../../API/CallApi/CallApi';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import IconButton from '@mui/material/IconButton';
import ReusableConfirmModal from '../../../../ui/Modal';

const MakeNewReport = ({
    setAllColumData,
    allColumDataBack,
    allColumData,
    otherReport,
    setOtherReprot,
    setAllColumDataBack,
    setOpenSnackbar,
    setErrorMessageColor,
    openSaveModal,
    setOpenSaveModal,
    currentOpenReport,
    setCurrentOpenReport
}) => {
    const [searchParams] = useSearchParams();
    const [reportNameError, setReportNameError] = useState('');
    const [subReportName, setSubReportName] = useState();
    const clientIpAddress = sessionStorage.getItem("clientIpAddress");
    const pid = searchParams.get("pid");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDeleteReport, setSelectedDeleteReport] = useState(null);
    const [selectedColumns, setSelectedColumns] = useState([]);

    useEffect(() => {
        if (openSaveModal) {
            setSelectedColumns(allColumDataBack || []);
        }
    }, [openSaveModal, allColumDataBack]);


    const handleOpenDelete = (report, e) => {
        e.stopPropagation();
        setSelectedDeleteReport(report);
        setDeleteDialogOpen(true);
    };
    const handleConfirmDelete = async () => {
        if (!selectedDeleteReport) return;
        const body = {
            con: JSON.stringify({
                mode: "DeleteSubReportData",
            }),
            p: JSON.stringify({
                SubReportId: selectedDeleteReport.SubReportId,
            }),
            f: "DynamicReport ( Delete sub report )",
        };

        await CallApi(body);
        setOtherReprot(prev =>
            prev.filter(r => r.SubReportId !== selectedDeleteReport.SubReportId)
        );
        if (currentOpenReport === selectedDeleteReport.SubReportName) {
            setAllColumData(allColumDataBack);
            setCurrentOpenReport("mainreport");
        }
        setDeleteDialogOpen(false);
        setSelectedDeleteReport(null);
        setErrorMessageColor('success');
        setOpenSnackbar(true);
    };

    const handleChangeReport = (data) => {
        if (data === "mainreport") {
            setAllColumData(allColumDataBack);
            setCurrentOpenReport("mainreport");
        } else {
            setCurrentOpenReport(data?.SubReportName);
            const subReportColumns = JSON.parse(data?.Columns);
            const updatedColumns = allColumDataBack
                .filter(col => subReportColumns.some(sc => Number(sc.ColId) === Number(col.ColId)))
                .map(col => {
                    const subCol = subReportColumns.find(sc => Number(sc.ColId) === Number(col.ColId));
                    return {
                        ...col,
                        IsVisible: "True",
                        // IsVisible: subCol.IsHidden === "False" ? "False" : "True",
                        DisplayOrder: subCol.ColumnOrder,
                    };
                });
            updatedColumns.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
            setAllColumData(updatedColumns);
        }
    };


    const MAX_VISIBLE = 4;
    const [anchorEl, setAnchorEl] = useState(null);
    const visibleReports = otherReport.slice(0, MAX_VISIBLE - 1);
    const hiddenReports = otherReport.slice(3);

    const open = Boolean(anchorEl);
    const reportBtnStyle = (active) => ({
        whiteSpace: "nowrap",
        border: "1px solid #6f53ff",
        borderRadius: "10px",
        px: 2,
        py: 0.7,
        minWidth: "fit-content",
        backgroundColor: active ? "#6f53ff" : "transparent",
        color: active ? "#fff" : "#6f53ff",
        "&:hover": {
            backgroundColor: active
                ? "#5a43e6"
                : "rgba(111,83,255,0.08)",
        },
    });

    const mapColumnsForSave = (allColumnData) => {
        return allColumnData.map((col) => ({
            ColId: Number(col.ColId),
            IsHidden: col.IsVisible === "True" ? "False" : "True",
            ColumnOrder: col.DisplayOrder,
            ColumnAlias: col.HeaderName || "",
            ColumnWidth: col.Width,
        }))
            .filter(col => col.IsHidden === "False");
    };

    const makeAllColumnsVisible = (columns = []) => {
        return columns.map(col => ({
            ...col,
            IsVisible: "True"
        }));
    };

    const handleSaveReport = async () => {
        setReportNameError('');
        if (!subReportName || !subReportName.trim()) {
            setReportNameError('Please enter a valid report name');
            return;
        }
        const isDuplicate = otherReport?.some(
            r => r.SubReportName?.toLowerCase() === subReportName.trim().toLowerCase()
        );
        if (isDuplicate) {
            setReportNameError('This report name already exists. Please use a new name.');
            return;
        }

        let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
        const keyPrefix = `${pid}_`;
        const matchingKey = Object.keys(sessionStorage).find(key =>
            key.startsWith(keyPrefix)
        );
        if (!matchingKey) return;
        const reportId = matchingKey.split("_")[1];
        const columnsToSave = mapColumnsForSave(allColumData);
        const body = {
            con: JSON.stringify({
                mode: "SaveSubReportData",
                appuserid: AllData?.LUId,
                IPAddress: clientIpAddress,
            }),
            p: JSON.stringify({
                ReportId: reportId,
                SubReportId: 0,
                SubReportName: subReportName.trim(),
                Filters: [],
                Columns: columnsToSave,
            }),
            f: "DynamicReport ( SaveSubReportData )",
        };

        const response = await CallApi(body);
        const statusObj = response?.rd?.find(r => r.stat === 1);
        if (!statusObj?.SubReportId) return;

        setCurrentOpenReport(subReportName);
        const mappedColumnsForOtherReport = JSON.stringify(
            columnsToSave.map(col => ({
                ReportId: reportId,
                SubReportId: statusObj.SubReportId,
                ColId: col.ColId,
                IsHidden: col.IsHidden,
                ColumnOrder: col.ColumnOrder,
                ColumnAlias: col.ColumnAlias,
                ColumnWidth: col.ColumnWidth,
            }))
        );

        const newSubReport = {
            SubReportId: statusObj.SubReportId,
            ReportId: reportId,
            SubReportName: subReportName.trim(),
            Filters: JSON.stringify([]),
            Columns: mappedColumnsForOtherReport,
        };

        setOtherReprot(prev => [...prev, newSubReport]); // add to end
        const columnsForUI = JSON.parse(mappedColumnsForOtherReport).map(col => {
            const fullCol = allColumData.find(c => Number(c.ColId) === Number(col.ColId));
            return {
                ...fullCol,
                IsVisible: col.IsHidden === "False" ? "True" : "False", // sync visibility
                DisplayOrder: col.ColumnOrder,
            };
        });
        columnsForUI.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
        setAllColumData(columnsForUI);
        setAllColumDataBack(makeAllColumnsVisible(allColumData));
        setErrorMessageColor('success');
        setOpenSnackbar(true);
        setSubReportName('');
        setOpenSaveModal(false);
    };

    const handleToggleColumn = (col) => {
        setSelectedColumns(prev => {
            const exists = prev.some(c => Number(c.ColId) === Number(col.ColId));
            if (exists) {
                return prev.filter(c => Number(c.ColId) !== Number(col.ColId));
            } else {
                return [...prev, col];
            }
        });
    };

    return (
        <div>
            {/* <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <div style={{ padding: 20, width: 350 }}>
                    <p style={{ fontSize: 16, fontWeight: 600 }}>
                        Are you sure you want to delete {selectedDeleteReport?.SubReportName} report?
                    </p>
                    <p style={{ color: "#666" }}>

                    </p>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            style={{ background: "#fc4141", color: "#fff" }}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </div>
            </Dialog> */}
            <ReusableConfirmModal
             open={deleteDialogOpen}
             onClose={() => setDeleteDialogOpen(false)}
             onConfirm={handleConfirmDelete}
             type="deleteStatus"
            />

            <Dialog open={openSaveModal} onClose={() => setOpenSaveModal(false)}>
                <div
                    style={{
                        width: '500px',
                        margin: '10px',
                        borderRadius: '5px'
                    }}>
                    <p style={{ fontSize: '18px', margin: '0px 0px 10px 0px', fontWeight: 600, textAlign: 'center' }}>Save Report</p>
                    <div>
                        <TextField
                            label="Make New Report Name"
                            value={subReportName}
                            onChange={(e) => {
                                setSubReportName(e.target.value);
                                setReportNameError('');
                            }} size="small"
                            fullWidth={false}
                            error={Boolean(reportNameError)}
                            helperText={reportNameError}
                            sx={{
                                width: 250,
                                '& .MuiInputBase-root': {
                                    height: 40
                                }
                            }}
                        />
                    </div>
                    <div style={{ marginTop: '15px' }}>
                        <p style={{ fontWeight: 600, margin: "10px 0px 5px 5px" }}>New Report Columns</p>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px'
                        }}>
                            {allColumData
                                ?.filter(col => col?.IsVisible == "True")
                                .map((col, index) => (
                                    <span
                                        key={index}
                                        style={{
                                            background: '#f1f1f1',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '12px'
                                        }}
                                    >
                                        {col?.HeaderName || col?.FieldName}
                                    </span>
                                ))}
                        </div>
                    </div>
                    <DialogActions>
                        <Button onClick={() => setOpenSaveModal(false)}
                            style={{ backgroundColor: '#fc4141', color: 'white' }}>Cancel</Button>
                        <Button variant="contained" onClick={handleSaveReport} style={{
                            backgroundColor: 'rgb(111, 83, 255)'
                        }}>
                            Save
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
            <Box
                sx={{
                    display: "flex",
                    gap: "10px",
                    padding: "6px",
                    justifyContent: 'flex-end'
                }}
            >
                {otherReport?.length != 0 &&
                    <Button
                        onClick={() => handleChangeReport("mainreport")}
                        sx={reportBtnStyle(currentOpenReport === "mainreport")}
                    >
                        Main Report
                    </Button>
                }

                {visibleReports?.length != 0 &&
                    visibleReports.map((data, ind) => {
                        const active = currentOpenReport === data.SubReportName;
                        return (
                            <Button
                                key={ind}
                                onClick={() => handleChangeReport(data)}
                                sx={reportBtnStyle(active)}
                            >
                                {data.SubReportName}
                                <IconButton
                                    size="small"
                                    onClick={(e) => handleOpenDelete(data, e)}
                                    sx={{ ml: 1, color: active ? "#fff" : "#6f53ff" }}
                                    style={{
                                        backgroundColor: active ? "" : '#dfe2f9',
                                        border: active && '1px solid white',
                                        height: '25px',
                                        width: '25px',
                                        margin: '0px',
                                        padding: '0px',
                                        right: '-10px'
                                    }}
                                >
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </Button>
                        );
                    })}

                {hiddenReports.length > 0 && (
                    <>
                        <Button
                            sx={{
                                ...reportBtnStyle(false),
                                fontWeight: 600,
                            }}
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
                        >
                            + More ▾
                        </Button>

                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={() => setAnchorEl(null)}
                            MenuListProps={{
                                onMouseLeave: () => setAnchorEl(null),
                            }}
                            PaperProps={{
                                sx: {
                                    borderRadius: "12px",
                                    width: "400px",
                                },
                            }}
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                                    gap: "12px",
                                    padding: "12px",
                                    maxWidth: "520px",
                                }}
                            >
                                {hiddenReports.map((data, ind) => {
                                    const active =
                                        currentOpenReport === data.SubReportName;

                                    return (
                                        <div
                                            key={ind}
                                            onClick={() => {
                                                handleChangeReport(data);
                                                setAnchorEl(null);
                                            }}
                                            style={{
                                                height: "90px",
                                                borderRadius: "10px",
                                                cursor: "pointer",
                                                border: active
                                                    ? "2px solid #6f53ff"
                                                    : "1px solid #dcdcdc",
                                                backgroundColor: active
                                                    ? "rgba(111,83,255,0.12)"
                                                    : "#fafafa",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                textAlign: "center",
                                                fontWeight: active ? 600 : 500,
                                                color: active ? "#6f53ff" : "#333",
                                                transition: "all 0.2s ease",
                                                position: 'relative'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow =
                                                    "0 4px 12px rgba(0,0,0,0.12)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = "none";
                                            }}
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleOpenDelete(data, e)}
                                                sx={{ ml: 1, color: active ? "#fff" : "#6f53ff" }}
                                                style={{
                                                    position: 'absolute',
                                                    right: '3px',
                                                    top: '3px',
                                                    backgroundColor: '#dfe2f9'
                                                }}
                                            >
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                            <p
                                                style={{
                                                    margin: 0,
                                                    padding: "6px",
                                                    fontSize: "14px",
                                                    lineHeight: "1.2",
                                                }}
                                            >
                                                {data.SubReportName}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </Menu>
                    </>
                )}
            </Box>
        </div>
    )
}

export default MakeNewReport