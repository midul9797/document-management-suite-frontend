/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  FileText,
  Users,
  Calendar,
  Trash2,
  UploadIcon,
  Loader2,
  Upload,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import { ApiGateway } from "@/shared/axios";
import { Card, CardContent } from "@/components/ui/card";
import { IDocument } from "@/interfaces";
import { format } from "date-fns";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { ShareModal } from "@/components/ShareModal";
import { FileUploadModal } from "@/components/FileUploadModal";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/Loading";
import CommentModal from "@/components/CommentModal";
import downloadFile from "@/helpers/downloadFile";
import { toast } from "sonner";

type Document = {
  _id: string;
  name: string;
  sharedBy?: string;
  accessTypes?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export default function DocumentList() {
  // ===========================
  // State Management
  // ===========================
  const [activeTab, setActiveTab] = useState("my-documents");
  const [myDocuments, setMyDocuments] = useState<IDocument[] | null>(null);
  const [sharedDocuments, setSharedDocuments] = useState<Document[] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentCommentModalId, setCurrentCommentModalId] =
    useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();
  const { user } = useUser();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [currentUpdateId, setCurrentUpdateId] = useState<string>("");

  // ===========================
  // Event Handlers
  // ===========================
  // Function to trigger file input click
  const handleUpdate = (id: string) => {
    setCurrentUpdateId(id);
    fileInputRef.current?.click();
  };

  // Function to open upload modal
  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  // Function to handle file upload from modal
  const handleFileUpload = async (file: File) => {
    try {
      await handleFileChange(file, "upload");
      // Close modal only after successful upload
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error("Upload failed:", error);
      // Don't close modal on error
    }
  };

  // Function to refresh documents
  const handleRefresh = () => {
    if (activeTab === "my-documents") {
      fetchDocuments();
    } else {
      fetchSharedDocuments();
    }
  };

  // Function to handle file changes and upload for existing documents
  const handleFileChange = (
    file: File,
    type: string = "upload"
  ): Promise<void> => {
    const maxFileSize = 10 * 1024 * 1024;

    // Check file type - only allow PDF files
    if (file.type !== "application/pdf") {
      toast.error(
        `Only PDF files are allowed. "${file.name}" is not a PDF file.`
      );
      return Promise.reject(new Error("Invalid file type"));
    }

    if (file.size > maxFileSize) {
      toast.error(
        `The file "${file.name}" exceeds the 10MB size limit and will not be uploaded.`
      );
      return Promise.reject(new Error("File too large"));
    }
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        if (type === "update") {
          setUpdating(currentUpdateId);
          const payload = {
            title: file.name,
            type: file.type,
            size: file.size,
            data: reader.result as string,
          };
          const token = await getToken();

          // Update document metadata
          const response = await ApiGateway.patch(
            `/document-metadata/${currentUpdateId}`,
            payload,
            {
              headers: { Authorization: token },
            }
          );
          setUpdating(null);
          if (response.data) toast.success("Document Updated Successfully");
          resolve();
        } else {
          setUploading(true);
          const payload = {
            title: file.name,
            type: file.type,
            size: file.size,
            data: (reader.result as string).split(",")[1],
          };
          const token = await getToken();
          try {
            if (payload.data) {
              console.log(payload.data.slice(0, 100));
              const metadata_response = await ApiGateway.post(
                "/document-metadata",
                payload,
                { headers: { Authorization: token } }
              );
              if (metadata_response.data) {
                toast.success("Document Uploaded Successfully");
              } else {
                toast.error("Document Upload Failed");
              }
            }
            resolve();
          } catch (error) {
            console.error("Error uploading file:", error);
            reject(error);
          } finally {
            setUploading(false);
          }
        }
        // Refresh documents after successful update
        if (activeTab === "my-documents") {
          fetchDocuments();
        } else {
          fetchSharedDocuments();
        }
      };

      // Error handling for file reading
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  // Function to handle file download
  const handleDownload = async (id: string, fileName: string, type: string) => {
    setDownloading(id);
    try {
      const token = await getToken();
      const { blob, name } = (await downloadFile(
        id,
        token as string,
        fileName,
        type
      )) as {
        blob: Blob;
        name: string;
      };
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Document downloaded successfully");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error downloading document");
    } finally {
      setDownloading(null);
    }
  };

  // Function to handle document deletion
  const handleDelete = async (documentId: string) => {
    setDeleting(documentId);
    const token = await getToken();
    try {
      // Shared documents do not contain document metadata id

      const responseDocDelete = await ApiGateway.patch(
        `/document-metadata/delete/${documentId}`,
        {},
        { headers: { Authorization: token } }
      );

      if (responseDocDelete) toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Error deleting document");
    } finally {
      setDeleting(null);
    }
    if (documentId === "") fetchSharedDocuments();
    else fetchDocuments();
  };

  // ===========================
  // API Calls
  // ===========================
  // Function to fetch user's documents
  const fetchDocuments = async () => {
    setLoading(true);
    const token = await getToken();
    const response = await ApiGateway("/document-metadata", {
      headers: { Authorization: token },
    });
    if (response.data) {
      const temp = [] as any;

      response.data.map((file: any) => {
        temp.push({
          _id: file._id,
          size: file.size,
          type: file.type,
          version: file.version,
          url: file.url,
          title: file.title,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt,
        });
      });
      setMyDocuments(temp);
    }
    setLoading(false);
  };

  // Function to fetch shared documents
  const fetchSharedDocuments = async () => {
    setLoading(true);
    const token = await getToken();

    const response = await ApiGateway.get("/document-metadata/shared", {
      headers: { Authorization: token },
    });
    if (response.data) {
      const temp = [] as any;
      response.data.map((file: any) => {
        const types = Object.keys(file.accessPermissions).filter((type) => {
          if (
            type !== "_id" &&
            file.accessPermissions[type].includes(
              user?.primaryEmailAddress?.emailAddress
            )
          ) {
            return type;
          }
        });

        temp.push({
          id: file._id,
          name: file.name,
          url: file.url,
          updatedAt: file.updatedAt
            ? format(file?.updatedAt, "PPP")
            : "Not Yet",
          sharedBy: file.author.name,
          accessTypes: types,
        });
      });
      setSharedDocuments(temp);
    }
    setLoading(false);
  };

  // ===========================
  // Effects
  // ===========================
  // Effect to fetch documents based on active tab
  useEffect(() => {
    if (myDocuments === null && activeTab === "my-documents") fetchDocuments();
    if (sharedDocuments === null && activeTab === "shared-documents")
      fetchSharedDocuments();
  }, [activeTab]);

  // ===========================
  // Rendering
  // ===========================
  return (
    <main className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">Document Management</h1>
        <div className="flex items-center gap-2">
          <FileUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onFileSelect={handleFileUpload}
            uploading={uploading}
          />
          <Button
            onClick={handleUploadClick}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-documents">My Documents</TabsTrigger>
            <TabsTrigger value="shared-documents">Shared Documents</TabsTrigger>
          </TabsList>
          <TabsContent value="my-documents">
            <div className="space-y-4">
              {loading ? (
                <Loading />
              ) : (
                myDocuments &&
                myDocuments.map((doc) => (
                  <Card key={doc._id} className="mt-4">
                    <CardContent className="flex flex-col lg:flex-row gap-3 items-center justify-between p-6">
                      <Link
                        href={`/dashboard/documents/${doc._id}?url=${doc.url}`}
                      >
                        <div className="flex items-center space-x-4">
                          <FileText className="h-8 w-8 text-blue-500" />
                          <div>
                            <h3
                              className="text-lg font-semibold truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px]"
                              title={doc.title}
                            >
                              {doc.title}
                            </h3>

                            <p className="text-sm text-gray-500 dark:text-gray-300">
                              <Calendar className="inline mr-1 h-3 w-3" />
                              Last Modified:{" "}
                              {format(doc.updatedAt || doc.createdAt, "PPP")}
                            </p>
                          </div>
                        </div>
                      </Link>

                      <div className="flex gap-4">
                        <ShareModal documentId={doc._id} />
                        {isCommentModalOpen &&
                          currentCommentModalId === doc._id && (
                            <CommentModal
                              isModalOpen={isCommentModalOpen}
                              onClose={() => setIsCommentModalOpen(false)}
                              documentId={currentCommentModalId}
                            />
                          )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCurrentCommentModalId(doc._id);
                                  setIsCommentModalOpen(true);
                                }}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Comments</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Input
                                  ref={fileInputRef}
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,application/pdf"
                                  onChange={(e) =>
                                    e.target.files &&
                                    handleFileChange(
                                      e.target.files[0],
                                      "update"
                                    )
                                  }
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdate(doc._id)}
                                >
                                  {updating === doc._id && (
                                    <Loader2 className="animate-spin" />
                                  )}
                                  {updating !== doc._id && (
                                    <UploadIcon className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Update</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(doc._id)}
                              >
                                {deleting === doc._id && (
                                  <Loader2 className="animate-spin" />
                                )}
                                {deleting !== doc._id && (
                                  <Trash2 color="red" className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleDownload(doc._id, doc.title, doc.type);
                                }}
                              >
                                {downloading === doc._id && (
                                  <Loader2 className="animate-spin" />
                                )}
                                {downloading !== doc._id && (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Download</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="shared-documents">
            <div className="space-y-4">
              {loading ? (
                <Loading />
              ) : (
                sharedDocuments &&
                sharedDocuments.map((doc) => (
                  <Card key={doc._id}>
                    <CardContent className="flex items-center justify-between p-6">
                      <Link
                        href={
                          doc.accessTypes?.includes("view")
                            ? `/dashboard/documents/${doc._id}`
                            : "#"
                        }
                      >
                        <div className="flex items-center space-x-4">
                          <FileText className="h-8 w-8 text-green-500" />
                          <div>
                            <h3
                              className="text-lg font-semibold truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px]"
                              title={doc.name}
                            >
                              {doc.name}
                            </h3>

                            <p className="text-sm text-gray-500 dark:text-gray-300">
                              <Calendar className="inline mr-1 h-3 w-3" />
                              Last Modified: {doc.updatedAt || doc.createdAt}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                              Access:{" "}
                              <strong>
                                {doc.accessTypes?.map(
                                  (type) =>
                                    type[0].toUpperCase() + type.slice(1) + ","
                                )}
                              </strong>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                              <Users className="inline mr-1 h-3 w-3" />
                              Shared by:{" "}
                              <span className="font-semibold text-blue-500">
                                {doc.sharedBy}
                              </span>
                            </p>
                          </div>
                        </div>
                      </Link>
                      <div className="flex gap-4">
                        <TooltipProvider>
                          {doc.accessTypes?.map((type) => {
                            if (type === "view")
                              return <span key={type}></span>;
                            else if (type === "delete") {
                              return (
                                <Tooltip key={type}>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        handleDelete(doc._id);
                                      }}
                                    >
                                      {deleting === doc._id && (
                                        <Loader2 className="animate-spin" />
                                      )}
                                      {deleting !== doc._id && (
                                        <Trash2
                                          color="red"
                                          className="h-4 w-4"
                                        />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            } else {
                              return (
                                <Tooltip key={type}>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,application/pdf"
                                        onChange={(e) =>
                                          e.target.files &&
                                          handleFileChange(
                                            e.target.files[0],
                                            "update"
                                          )
                                        }
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleUpdate(doc._id)}
                                      >
                                        {updating !== doc._id && (
                                          <UploadIcon className="h-4 w-4" />
                                        )}
                                        {updating === doc._id && (
                                          <Loader2 className="animate-spin" />
                                        )}
                                      </Button>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Update</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            }
                          })}
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
