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
const downloadFile = async (fileId: string, token: string) => {
  const res = await ApiGateway.get(`/file/download/${fileId}`, {
    headers: {
      Authorization: token,
    },
  });

  if (res) {
    const blob = b64toBlob(res.data.split(",")[1], res.meta.type);
    return { blob, name: res.meta.name };
  }
};

/**
 * Converts a base64 string to a Blob object
 * @param b64Data - The base64 string to convert
 * @param contentType - The MIME type of the data (defaults to empty string)
 * @param sliceSize - The size of chunks to process (defaults to 512 bytes)
 * @returns Blob object containing the converted data
 */
const b64toBlob = (b64Data: string, contentType = "", sliceSize = 512) => {
  // Decode base64 string to binary
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

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
