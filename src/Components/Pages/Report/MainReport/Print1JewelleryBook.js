import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Print1JewelleryBook.css";
import img from "../../../images/noFound.jpg";

export default function Print1JewelleryBook({ visibleItemsMain }) {
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(false);
  const [withImage, setWithImage] = useState(true);
  const itemsPerPage = 1000; // how many items per page to show
  const [currentPage, setCurrentPage] = useState(1);

  const visibleItems = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return visibleItemsMain?.slice(startIdx, endIdx);
  }, [visibleItemsMain, currentPage, itemsPerPage]);

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

  const getPageNumbers = () => {
    const pages = [];
    const totalPageCount = totalPages;
    const maxVisible = 5;

    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + maxVisible - 1, totalPageCount);

    // Shift start if we're at the end to still show 5 pages
    if (end - start < maxVisible - 1) {
      start = Math.max(end - maxVisible + 1, 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const totalPages = Math.ceil((visibleItemsMain?.length || 0) / itemsPerPage);

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

  const sortedItems = [...visibleItems]?.sort((a, b) => {
    const numA = Number(String(a?.Sr_JobNo || "").split("/")[1] || 0);
    const numB = Number(String(b?.Sr_JobNo || "").split("/")[1] || 0);

    return numB - numA; // DESCENDING
  });

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
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {getPageNumbers().map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={num === currentPage ? "active" : ""}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        <p
          className="text-center text-sm text-gray-600 mt-1 transition-opacity duration-200 ease-in-out printHide"
          style={{
            textAlign: "center",
          }}
        >
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </p>
        <div className="container disflx">
          {sortedItems?.map((e, i) => (
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
                    src={`${e?.ImgUrl}`}
                    loading="lazy"
                    alt="Design_Image"
                    onError={handleImageError}
                  />
                </div>
              )}
              <div className="w-100 spaclftTpm">
                <div className="w-100 spfntBld spbrWord spfntHead">
                  {e?.designno}
                </div>
              </div>

              <div className="w-100 disflxCen spaclftTpm">
                <div className="wdth_45 spbrWord">{e?.Status}</div>
                {e?.Manufacturer !== "" ? (
                  <div className="spfntBld">|</div>
                ) : null}
                <div className="wdth_55 spacrighTpm spbrWord">
                  {e?.Manufacturer}
                </div>
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
                  {e?.Sr_JobNo}
                </div>
              </div>

              <div className="w-100 disflxCen spaclftTpm">
                {e?.Metal_Color && (
                  <div className="wdth_45 spbrWord">{e?.Metal_Color}</div>
                )}
                {e?.Metal_Color ? <div>|</div> : null}

                <div
                  className={`${
                    e?.Metal_Color !== ""
                      ? "wdth_55 spacrighTpm"
                      : "w-100 spfntlft"
                  } spbrWord`}
                >
                  G.WT: {fixedValues(e?.Gross_Wt, 3)} gm
                </div>
              </div>

              {e?.Diam_Ctw || e?.CS_Ctw ? (
                <div className="w-100 disflxCen spaclftTpm">
                  <div className="wdth_45 spbrWord">
                    DIA: {e?.Diam_Ctw ? `${fixedValues(e?.Diam_Ctw, 3)}` : null}
                  </div>

                  {e?.CS_Ctw || e?.Misc_Ctw ? <div>|</div> : null}
                  <div
                    className={`${
                      e?.Misc_Ctw !== ""
                        ? "wdth_55 spacrighTpm"
                        : "w-100 spfntlft"
                    } spbrWord`}
                  >
                    N.WT: {fixedValues(e?.Metal_Wt, 3)} gm
                  </div>
                </div>
              ) : null}

              <div className="w-100 disflxCen spaclftTpm">
                {e?.Misc_Ctw ? (
                  <div className="w-100 disflx spaclftTpm spbrWord">
                    MISC: {fixedValues(e?.Misc_Ctw, 3)}
                  </div>
                ) : null}
                <div className="wdth_55 spacrighTpm spbrWord">
                  {e?.CS_Ctw
                    ? `CS: ${fixedValues(e?.CS_Ctw, 3)}`
                    : e?.Misc_Ctw
                    ? `MISC: ${fixedValues(e?.Misc_Ctw, 3)}`
                    : null}
                </div>
              </div>

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
