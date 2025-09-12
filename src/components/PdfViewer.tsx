/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect, useRef } from "react";
// // import { b64toBlob } from "@/helpers/downloadFile";

// export default function PdfViewer({ file }: { file: string }) {
//   const containerRef = useRef(null);

//   useEffect(() => {
//     const container = containerRef.current; // This `useRef` instance will render the PDF.

//     let PSPDFKit, instance;

//     (async function () {
//       PSPDFKit = await import("pspdfkit");

//       PSPDFKit.unload(container); // Ensure that there's only one PSPDFKit instance.

//       instance = await PSPDFKit.load({
//         // Container where PSPDFKit should be mounted.
//         container,
//         // The document to open.
//         document: file,
//         // Use the public directory URL as a base URL. PSPDFKit will download its library assets from here.
//         baseUrl: `${window.location.protocol}//${window.location.host}/`,
//       });
//     })();

//     return () => PSPDFKit && PSPDFKit.unload(container);
//   }, [file]);

//   // This div element will render the document to the DOM.
//   return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
// }
import { useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PdfViewer({ file }: { file: string }) {
  const [numPages, setNumPages] = useState(0);
  // const bytes = Uint8Array.from(atob(file), (c) => c.charCodeAt(0));
  // const blob = new Blob([bytes], { type: "application/pdf" });
  function onDocumentLoadSuccess({ numPages: nextNumPages }: any): void {
    console.log(nextNumPages);
    setNumPages(nextNumPages);
  }
  const [scale, setScale] = useState(1);
  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-2 items-center">
        <button
          onClick={() => setScale(scale - 0.1)}
          disabled={scale <= 0.5}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Zoom Out
        </button>
        <span className="px-3 py-1 bg-gray-100 rounded">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(scale + 0.1)}
          disabled={scale >= 3}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Zoom In
        </button>
        <button
          onClick={() => setScale(1)}
          className="px-3 py-1 bg-gray-500 text-white rounded"
        >
          Reset
        </button>
        <button
          onClick={() => setScale(1.2)}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Fit Width
        </button>
      </div>
      <div className="border border-gray-300 shadow-lg">
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              scale={scale}
              className="mb-2"
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
