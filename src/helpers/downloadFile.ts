// ===========================
// Imports
// ===========================
import { ApiGateway } from "@/shared/axios";

// ===========================
// Helper Functions
// ===========================

/**
 * Downloads a file from the server using the provided file ID and authentication token
 * @param fileId - The ID of the file to download
 * @param token - Authentication token for authorization
 * @returns Object containing the blob data and filename, or undefined if request fails
 */
const downloadFile = async (
  fileId: string,
  token: string,
  name: string,
  type: string
) => {
  const res = await ApiGateway.get(`/document-metadata/download/${fileId}`, {
    headers: {
      Authorization: token,
    },
  });

  if (res) {
    // Handle different base64 data formats
    let base64Data = res.data;

    // If it's a data URL format (data:type;base64,data)
    if (base64Data.includes(",")) {
      base64Data = base64Data.split(",")[1];
    }
    // If it's malformed format (dataapplication/pdfbase64data)
    else if (base64Data.startsWith("data") && base64Data.includes("base64")) {
      // Find where the actual base64 data starts
      const base64Index = base64Data.indexOf("base64") + 6;
      base64Data = base64Data.substring(base64Index);
    }
    // If it's just the base64 data without any prefix
    else {
      base64Data = res.data;
    }

    const blob = b64toBlob(base64Data, type);
    return { blob, name };
  }
};

/**
 * Converts a base64 string to a Blob object
 * @param b64Data - The base64 string to convert
 * @param contentType - The MIME type of the data (defaults to empty string)
 * @param sliceSize - The size of chunks to process (defaults to 512 bytes)
 * @returns Blob object containing the converted data
 */
export const b64toBlob = (
  b64Data: string,
  contentType = "",
  sliceSize = 512
) => {
  // Normalize and sanitize base64 string
  let normalized = (b64Data || "").trim();
  // Remove any whitespace/newlines
  normalized = normalized.replace(/\s+/g, "");
  // Convert URL-safe base64 to standard base64
  normalized = normalized.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding if missing
  const padding = normalized.length % 4;
  if (padding) {
    normalized += "=".repeat(4 - padding);
  }

  let byteCharacters: string;
  try {
    byteCharacters = atob(normalized);
  } catch (err) {
    console.log(err);
    throw new Error("Invalid base64 data: unable to decode");
  }

  const byteArrays = [] as Uint8Array[];

  // Process data in chunks
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    // Convert characters to byte numbers
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    // Create typed array from byte numbers
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  // Create and return blob from byte arrays
  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

export default downloadFile;
