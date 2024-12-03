"use client";
import React from "react";
import { pdfjs } from "react-pdf";

import PdfViewer from "./PdfViewer";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.mjs",
//   import.meta.url
// ).toString();
const DocumentViewer = ({ documentUrl }: { documentUrl: string }) => {
  return (
    <div className="document-viewer p-4 bg-white rounded-lg shadow">
      <PdfViewer file={documentUrl} />
    </div>
  );
};

export default DocumentViewer;
