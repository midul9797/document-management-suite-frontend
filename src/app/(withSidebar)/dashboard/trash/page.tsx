"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApiGateway } from "@/shared/axios";
import { useAuth } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { FileText, RotateCcw, Trash2, Loader2 } from "lucide-react";

interface TrashDocument {
  _id: string;

  title: string;
  size: number;
  deletedAt: string;
}

const Trash = () => {
  const [trashDocuments, setTrashDocuments] = useState<TrashDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deletingPermanently, setDeletingPermanently] = useState<string | null>(
    null
  );
  const { getToken } = useAuth();

  // Function to format file size
  //   const formatFileSize = (bytes: number) => {
  //     if (bytes === 0) return "0 Bytes";
  //     const k = 1024;
  //     const sizes = ["Bytes", "KB", "MB", "GB"];
  //     const i = Math.floor(Math.log(bytes) / Math.log(k));
  //     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  //   };

  // Function to fetch trash documents
  const fetchTrashDocuments = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await ApiGateway.get("/document-metadata/deleted", {
        headers: { Authorization: token },
      });
      if (response.data) {
        setTrashDocuments(response.data);
      }
    } catch (error) {
      console.error("Error fetching trash documents:", error);
    }
    setLoading(false);
  };

  // Function to restore document
  const handleRestore = async (documentId: string) => {
    setRestoring(documentId);
    try {
      const token = await getToken();

      // Restore document metadata
      await ApiGateway.patch(
        `/document-metadata/restore/${documentId}`,
        {},
        {
          headers: { Authorization: token },
        }
      );

      // Remove from trash list
      setTrashDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
      alert("Document restored successfully");
    } catch (error) {
      console.error("Error restoring document:", error);
      alert("Error restoring document");
    }
    setRestoring(null);
  };

  // Function to permanently delete document
  const handlePermanentDelete = async (documentId: string) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this document? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingPermanently(documentId);
    try {
      const token = await getToken();

      // Permanently delete document metadata
      await ApiGateway.delete(`/document-metadata/${documentId}`, {
        headers: { Authorization: token },
      });

      // Remove from trash list
      setTrashDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
      alert("Document permanently deleted");
    } catch (error) {
      console.error("Error permanently deleting document:", error);
      alert("Error permanently deleting document");
    }
    setDeletingPermanently(null);
  };

  useEffect(() => {
    fetchTrashDocuments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trash</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {trashDocuments.length} item(s) in trash
        </p>
      </div>

      {trashDocuments.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No items in trash
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your deleted documents will appear here.
          </p>
        </div>
      ) : (
        trashDocuments.map((doc) => (
          <Card key={doc._id} className="mt-4">
            <CardContent className="flex flex-col lg:flex-row gap-3 items-center justify-between p-6">
              <div className="flex items-center space-x-4">
                <FileText className="h-8 w-8 text-gray-500" />
                <div>
                  <h3 className="text-lg font-semibold">{doc.title}</h3>

                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    Deleted: {new Date(doc.deletedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(doc._id)}
                        disabled={restoring === doc._id}
                      >
                        {restoring === doc._id ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <RotateCcw className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Restore</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePermanentDelete(doc._id)}
                        disabled={deletingPermanently === doc._id}
                      >
                        {deletingPermanently === doc._id ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <Trash2 color="red" className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Permanently</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default Trash;
