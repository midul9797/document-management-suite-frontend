"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { ApiGateway } from "@/shared/axios";
import { useAuth } from "@clerk/nextjs";
import { Loading } from "@/components/Loading";

// ===========================
// Dynamic Imports
// ===========================
const DocumentViewer = dynamic(() => import("@/components/DocumentViewer"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

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
      {/* Document Viewer Component */}
      {file && <DocumentViewer documentUrl={file.data} />}
    </>
  );
};

export default DocumentViewerPage;