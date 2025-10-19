/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";

import { useParams, useSearchParams } from "next/navigation";
import { ApiGateway } from "@/shared/axios";
import { useAuth } from "@clerk/nextjs";
import { Loading } from "@/components/Loading";
import dynamic from "next/dynamic";
const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
});
const DocumentViewerPage: React.FC = () => {
  // ===========================
  // State & Hooks
  // ===========================
  const { id } = useParams();
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const [file, setFile] = useState<{ data: string } | null>(null);
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  // ===========================
  // Data Fetching
  // ===========================
  const fetchFile = async () => {
    setLoading(true);
    const token = await getToken();
    const res = await ApiGateway.get(`/document-metadata/download/${id}`, {
      headers: {
        Authorization: token,
      },
    });

    if (res) {
      // Handle different base64 data formats

      const base64Data = res.data;
      setFile({ data: base64Data });
    }
    setLoading(false);
  };

  // ===========================
  // Effects
  // ===========================
  useEffect(() => {
    if (!file) fetchFile();
  }, []);

  if (loading) return <Loading />;

  // // ===========================
  // Render Component
  // ===========================
  return (
    <>
      {/* PDF Viewer Component */}
      {file && <PdfViewer file={url as string} />}
    </>
  );
};

export default DocumentViewerPage;
