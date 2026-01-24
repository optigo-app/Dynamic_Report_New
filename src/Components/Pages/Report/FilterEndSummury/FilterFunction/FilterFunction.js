import { TextField } from "@mui/material";



export const renderFilter = (col, draftFilters, setDraftFilters, setFiltersShowDraf) => {
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
                                const value = e.target.value.replace(/^\s+/, ""); 
                                setDraftFilters((prev) => ({
                                    ...prev,
                                    [col.FieldName]: value,
                                }));

                                setFiltersShowDraf((prev) => ({
                                    ...prev,
                                    [col.headerNamesingle]: value,
                                }));
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
};

