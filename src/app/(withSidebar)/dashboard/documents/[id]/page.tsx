"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { ApiGateway } from "@/shared/axios";
import { useAuth } from "@clerk/nextjs";
import { Loading } from "@/components/Loading";
import PdfViewer from "@/components/PdfViewer";

const DocumentViewerPage: React.FC = () => {
  // ===========================
  // State & Hooks
  // ===========================
  const { id } = useParams();
  const [file, setFile] = useState<{ data: string; type: string } | null>(null);
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  // ===========================
  // Data Fetching
  // ===========================
  const fetchFile = async () => {
    setLoading(true);
    const token = await getToken();
    const response = await ApiGateway.get(`/file/${id}`, {
      headers: { Authorization: token },
    });
    if (response.data) {
      setFile(response.data);
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

  // ===========================
  // Render Component
  // ===========================
  return (
    <>
      {/* PDF Viewer Component */}
      {file && <PdfViewer file={file.data} />}
    </>
  );
};

export default DocumentViewerPage;
