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
}) {


    const [openPrintModel, setOpenPrintModel] = useState(false);
    const [showPrintView, setShowPrintView] = useState(false);
  
  const fetchData = async () => {
    try {
      if (OtherKeyData == null) {
        return;
      }
      setAllRowData(OtherKeyData?.rd3);
      setAllColumIdWiseName(OtherKeyData?.rd2);
      setMasterKeyData(OtherKeyData?.rd[0]);
      let rd1 = OtherKeyData?.rd1 ? [...OtherKeyData.rd1] : [];
      rd1.sort((a, b) => (a.DisplayOrder ?? 999) - (b.DisplayOrder ?? 999));
      setAllColumData(rd1);
      const grupCheckboxMap = (rd1 || [])
        .filter((col) => col?.GrupChekBox == "True")
        .reduce((acc, col) => {
          acc[col.FieldName] = col.DefaultGrupChekBox == "True";
          return acc;
        }, {});
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

  const [filteredRows, setFilteredRows] = useState(originalRows);
  const [filters, setFilters] = useState({});
  const firstLoad = useRef(true);

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
      // if (!firstLoad.current && isMatch && filterState && selectedDateColumn) {
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
    // if (firstLoad.current) {
    //   firstLoad.current = false;
    // }
  }, [filters, commonSearch, startDate, columns, selectedDateColumn]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
        {showPrintView ? (
              <div ref={printRef}>
                <Print1JewelleryBook visibleItems={printData} />
              </div>
            ) : (
      <div
        className="dynamic_sample_report_main"
        sx={{ width: "100vw", display: "flex", flexDirection: "column" }}
        ref={gridContainerRef}
      >
        <Dialog
          open={openPrintModel}
          onClose={() => setOpenPrintModel(false)}
          className="print_model_main"
        >
          <div>
            <Print1JewelleryBook visibleItems={filteredRows} />
          </div>
        </Dialog>

        <div style={{ display: "flex", alignItems: "end", gap: "10px" }}>
          {masterKeyData?.PrintButton == "True" && (
            <Tooltip title="Print">
              <IconButton
                    onClick={() => setShowPrintView(true)}
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
        </div>
        <div
          ref={gridRef}
          style={{
            height: showImageView
              ? "70vh"
              : summaryColumns?.length == 0
              ? "calc(100vh - 190px)"
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
              {filteredRows.map((item, idx) => {
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
                sortModel={sortModel}
                onSortModelChange={(model) => setSortModel(model)}
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
      </div>
      )}
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
