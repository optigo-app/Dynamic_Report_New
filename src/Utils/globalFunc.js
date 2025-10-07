import Cookies from "js-cookie";

export async function readAndDecodeCookie(cookieName) {
  const rawCookie = Cookies.get(cookieName);
  if (!rawCookie) return null;

  try {
    const decodedURI = decodeURIComponent(rawCookie);
    const parsedObj = JSON.parse(decodedURI);
    const safeBase64Decode = (val) => {
      if (typeof val !== "string") return val;
      try {
        const decoded = atob(val);
        return /^[\x09\x0A\x0D\x20-\x7E]*$/.test(decoded) ? decoded : val;
      } catch {
        return val;
      }
    };
    const result = Object.fromEntries(
      Object.entries(parsedObj).map(([key, value]) => {
        const decodedValue = safeBase64Decode(value);
        if (key === "YearCode" && typeof decodedValue === "string") {
          return [key, btoa(decodedValue)];
        }
        return [key, decodedValue];
      })
    );

    return result;
  } catch (err) {
    console.error("Failed to decode cookie:", err);
    return null;
  }
}
