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
} from "lucide-react";
import { ApiGateway } from "@/shared/axios";
import { Card, CardContent } from "@/components/ui/card";
import { IDocument } from "@/interfaces";
import { format } from "date-fns";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { ShareModal } from "@/components/ShareModal";
import downloadFile from "@/helpers/downloadFile";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/Loading";

type Document = {
  id: string;
  name: string;
  lastModified: string;
  sharedBy?: string;
  accessTypes?: string[];
};

export default function DocumentList() {
  // ===========================
  // State Management
  // ===========================
  const [activeTab, setActiveTab] = useState("my-documents");
  const [myDocuments, setMyDocuments] = useState<IDocument[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();
  const { user } = useUser();

  // ===========================
  // Event Handlers
  // ===========================
  // Function to trigger file input click
  const handleUpdate = () => {
    fileInputRef.current?.click();
  };

  // Function to handle file changes and upload
  const handleFileChange = (file: File, id: string = "", fileId: string) => {
    const reader = new FileReader();

    reader.onload = async () => {
      setUpdating(true);
      const payload = {
        fileId: fileId,
        file: {
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result as string,
        },
      };
      const token = await getToken();

      // Shared documents do not contain document metadata id
      if (id === "") {
        const documentResponse = await ApiGateway.get(
          `/document-metadata/file/${fileId}`,
          { headers: { Authorization: token } }
        );
        id = documentResponse.data.id;
      }
      console.log(id, fileId);
      // Update document metadata
      const response = await ApiGateway.patch(
        `/document-metadata/${id}`,
        payload,
        {
          headers: { Authorization: token },
        }
      );
      setUpdating(false);
      if (response.data) alert("Document Updated Successfully");
      if (id === "") fetchSharedDocuments();
      else fetchDocuments();
    };

    // Error handling for file reading
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };
    reader.readAsDataURL(file);
  };

  // Function to handle file download
  const handleDownload = async (fileId: string) => {
    const token = await getToken();
    const { blob, name } = (await downloadFile(fileId, token as string)) as {
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
  };

  // Function to handle document deletion
  const handleDelete = async (documentId: string, fileId: string) => {
    setDeleting(true);
    const token = await getToken();
    // Shared documents do not contain document metadata id
    if (documentId === "") {
      const documentResponse = await ApiGateway.get(
        `/document-metadata/file/${fileId}`,
        { headers: { Authorization: token } }
      );
      documentId = documentResponse.data.id;
    }

    const responseDocDelete = await ApiGateway.delete(
      `/document-metadata/${documentId}`,
      { headers: { Authorization: token } }
    );
    const responseFileDelete = await ApiGateway.delete(`/file/${fileId}`, {
      headers: { Authorization: token },
    });
    setDeleting(false);
    if (responseDocDelete && responseFileDelete) alert("deleted");
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
          id: file.id,
          fileId: file.fileId,
          title: file.title,
          lastModified: file.lastModified,
          bookingTitle: file.BookingRecord.title,
          bookingDate: file.BookingRecord.bookingDate,
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
    const response = await ApiGateway.get("/file/share", {
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
          lastModified: file.updatedAt
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
    if (myDocuments.length === 0 && activeTab === "my-documents")
      fetchDocuments();
    if (sharedDocuments.length === 0 && activeTab === "shared-documents")
      fetchSharedDocuments();
  }, [activeTab, sharedDocuments]);

  // ===========================
  // Rendering
  // ===========================
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Document Management</h1>
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
                myDocuments.map((doc) => (
                  <Card key={doc.fileId} className="mt-4">
                    <CardContent className="flex flex-col lg:flex-row gap-3 items-center justify-between p-6">
                      <Link href={`/dashboard/documents/${doc.fileId}`}>
                        <div className="flex items-center space-x-4">
                          <FileText className="h-8 w-8 text-blue-500" />
                          <div>
                            <h3 className="text-lg font-semibold">
                              {doc.title}
                            </h3>

                            <p className="text-sm text-gray-500 dark:text-gray-300">
                              Booking: {doc.bookingTitle} on {doc.bookingDate}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                              <Calendar className="inline mr-1 h-3 w-3" />
                              Last Modified: {format(doc.lastModified, "PPP")}
                            </p>
                          </div>
                        </div>
                      </Link>
                      <div className="flex gap-4">
                        <ShareModal fileId={doc.fileId} />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Input
                                  ref={fileInputRef}
                                  type="file"
                                  className="hidden"
                                  onChange={(e) =>
                                    e.target.files &&
                                    handleFileChange(
                                      e.target.files[0],
                                      doc.id,
                                      doc.fileId
                                    )
                                  }
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdate()}
                                >
                                  {updating && (
                                    <Loader2 className="animate-spin" />
                                  )}
                                  {!updating && (
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
                                onClick={() => handleDelete(doc.id, doc.fileId)}
                              >
                                {deleting && (
                                  <Loader2 className="animate-spin" />
                                )}
                                {!deleting && (
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
                                  handleDownload(doc.fileId);
                                }}
                              >
                                <Download className="h-4 w-4" />
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
                sharedDocuments.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="flex items-center justify-between p-6">
                      <Link
                        href={
                          doc.accessTypes?.includes("view")
                            ? `/dashboard/documents/${doc.id}`
                            : "#"
                        }
                      >
                        <div className="flex items-center space-x-4">
                          <FileText className="h-8 w-8 text-green-500" />
                          <div>
                            <h3 className="text-lg font-semibold">
                              {doc.name}
                            </h3>

                            <p className="text-sm text-gray-500 dark:text-gray-300">
                              <Calendar className="inline mr-1 h-3 w-3" />
                              Last Modified: {doc.lastModified}
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
                                        handleDelete(doc.id, doc.id);
                                      }}
                                    >
                                      {deleting && (
                                        <Loader2 className="animate-spin" />
                                      )}
                                      {!deleting && (
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
                                        onChange={(e) =>
                                          e.target.files &&
                                          handleFileChange(
                                            e.target.files[0],
                                            "",
                                            doc.id
                                          )
                                        }
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleUpdate()}
                                      >
                                        {!updating && (
                                          <UploadIcon className="h-4 w-4" />
                                        )}
                                        {updating && (
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
