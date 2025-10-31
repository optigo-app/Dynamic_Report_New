import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Print1JewelleryBook.css";
import img from "../../../images/noFound.jpg";

export default function Print1JewelleryBook({ visibleItems }) {
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(false);
  const [withImage, setWithImage] = useState(true);

  const handlePrintCurrentPage = () => {
    if (visibleItems.length === 0) return;
    let attempts = 0;
    const maxAttempts = 200;

    const waitForDOM = () => {
      requestAnimationFrame(() => {
        attempts++;
        const items = document.querySelectorAll(".col1");
        if (items.length >= visibleItems.length || attempts > maxAttempts) {
        } else {
          waitForDOM();
        }
      });
    };

    waitForDOM();
  };

  const imgPath = result?.DT1?.[0]?.ImageUploadLogicalPath || "";
  const fixedValues = (value, zeroes) =>
    typeof value === "number"
      ? value?.toFixed(zeroes)
      : (+value)?.toFixed(zeroes);

  const handleImageError = (e) => {
    e.target.src = img;
  };

  const handleImageHideShow = useCallback(() => {
    setWithImage(!withImage);
  }, [withImage]);

  return loader ? (
    <p>Loading...</p>
  ) : msg !== "" ? (
    <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
      {msg}
    </p>
  ) : (
    <>
      <div className="w-full flex items-center justify-center">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <label
            htmlFor="WithImage"
            className="inline-flex items-center cursor-pointer gap-2 fil_sec"
            style={{
              marginLeft: "30%",
            }}
          >
            <input
              type="checkbox"
              checked={withImage}
              onChange={handleImageHideShow}
              name="WithImage"
              id="WithImage"
            />
            with Image
          </label>
        </div>
        <div className="container disflx">
          {visibleItems.map((e, i) => (
            <div key={i} className="col1 brbxAll spfntbH pagBrkIns">
              {e?.Customer ? (
                <div className="w-100 brBtom spaclftTpm spacBtom spfntHead">
                  {e?.Customer}
                </div>
              ) : (
                <div className="minheit brBtom"></div>
              )}
              {withImage && e?.ImageName !== "" && (
                <div className="w-100 brBtom imgwdtheit">
                  <img
                    src={`${imgPath}/${e?.ImageName}`}
                    loading="lazy"
                    alt="Design_Image"
                    onError={handleImageError}
                  />
                </div>
              )}
              <div className="w-100 spaclftTpm">
                <div className="w-100 spfntBld spbrWord spfntHead">
                  {e?.DesNo}
                </div>
              </div>

              <div className="w-100 disflxCen spaclftTpm">
                <div className="wdth_45 spbrWord">{e?.Status}</div>
                {e?.JobNo !== "" ? <div className="spfntBld">|</div> : null}
                <div className="wdth_55 spacrighTpm spbrWord">{e?.JobNo}</div>
              </div>

              <div className="w-100 disflxCen spaclftTpm">
                {e?.Metal_Type && (
                  <div className="wdth_45 spbrWord">{e?.Metal_Type}</div>
                )}
                {e?.Metal_Type ? <div>|</div> : null}
                <div
                  className={`${
                    e?.Metal_Type !== ""
                      ? "wdth_55 spacrighTpm"
                      : "w-100 spfntlft"
                  } spbrWord`}
                >
                  G.WT: {fixedValues(e?.Gross_Wt, 3)} gm
                </div>
              </div>

              <div className="w-100 disflxCen spaclftTpm">
                {e?.Metal_Color && (
                  <div className="wdth_45 spbrWord">{e?.Metal_Color}</div>
                )}
                {e?.Metal_Color ? <div>|</div> : null}
                <div
                  className={`${
                    e?.Metal_Type !== ""
                      ? "wdth_55 spacrighTpm"
                      : "w-100 spfntlft"
                  } spbrWord`}
                >
                  N.WT: {fixedValues(e?.Metal_Wt, 3)} gm
                </div>
              </div>

              {e?.Diam_Ctw || e?.CS_Ctw ? (
                <div className="w-100 disflxCen spaclftTpm">
                  <div className="wdth_45 spbrWord">
                    DIA: {e?.Diam_Ctw ? `${fixedValues(e?.Diam_Ctw, 3)}` : null}
                  </div>
                  {e?.CS_Ctw || e?.Misc_Ctw ? <div>|</div> : null}
                  <div className="wdth_55 spacrighTpm spbrWord">
                    {e?.CS_Ctw
                      ? `CS: ${fixedValues(e?.CS_Ctw, 3)}`
                      : e?.Misc_Ctw
                      ? `MISC: ${fixedValues(e?.Misc_Ctw, 3)}`
                      : null}
                  </div>
                </div>
              ) : null}

              {e?.CS_Ctw && e?.Misc_Ctw ? (
                <div className="w-100 disflx spaclftTpm spbrWord">
                  MISC: {fixedValues(e?.Misc_Ctw, 3)}
                </div>
              ) : null}

              {e?.Inwardno ? (
                <div className="w-100 disflx spaclftTpm spbrWord">
                  Inward: {e?.Inwardno}
                </div>
              ) : null}

              {e?.Status === "Sold" && (
                <div className="w-100 spbrWord disflx spaclftTpm">
                  Sale: {e?.InvoiceNo}
                </div>
              )}

              {e?.Status === "In Memo" && (
                <div className="w-100 disflx spbrWord spaclftTpm">
                  Memo: {e?.InvoiceNo}
                </div>
              )}

              {e?.Status === "In Repair" && (
                <div className="w-100 disflx spaclftTpm spbrWord">
                  Repair: {e?.InvoiceNo}
                </div>
              )}

              {e?.Status === "Purchase Return" && (
                <div className="w-100 disflx spaclftTpm spbrWord">
                  Pur. Return: {e?.InvoiceNo}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
