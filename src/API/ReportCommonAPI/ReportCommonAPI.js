import axios from "axios";

const APIURL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "nzen"
    ? "http://newnextjs.web/api/report"
    : "https://nxt03.optigoapps.com/api/report";

// : "https://view.optigoapps.com/ExpressApp/EvoApp.aspx";
// const APIURL = "https://view.optigoapps.com/ExpressApp/EvoApp.aspx";
// const APIURL = "https://livenx.optigoapps.com/api/report";
// const APIURL = "http://nzen/jo/ExpressApp/EvoApp.aspx";

export const ReportCommonAPI = async (body, spNumber) => {
  let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

  const headerOnline = {
    Yearcode: `${AllData?.YearCode}`,
    version: `${AllData?.cuVer}`,
    sv: `${AllData?.SV}`,
    sp: spNumber,
  };

  const headerLocal = {
    Yearcode: `${AllData?.YearCode}`,
    version: `${AllData?.cuVer}`,
    sv: `${AllData?.SV}`,
    sp: spNumber,
  };

  const header =
    window.location.hostname === "localhost" ||
    window.location.hostname === "nzen"
      ? headerLocal
      : headerOnline;

  try {
    const response = await axios.post(AllData?.rptapiurl, body, { headers: header });
    return response?.data;
  } catch (error) {
    console.error("error is..", error);
  }
};
