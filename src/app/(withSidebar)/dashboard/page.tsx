"use client";

// ===========================
// Imports
// ===========================
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/Overview";
import { DocumentStats } from "@/components/DocumentStats";
import { FileText, Share2, Upload, Eye, MessageCircle } from "lucide-react";
import { useStore } from "@/zustand/store";
import { useEffect, useState } from "react";
import { ApiGateway } from "@/shared/axios";
import { useAuth } from "@clerk/nextjs";
import { IDocument } from "@/interfaces";
import { format } from "date-fns";
import Link from "next/link";

export default function DashboardPage() {
  // ===========================
  // State Management
  // ===========================
  const { user, notifications } = useStore();
  const { getToken } = useAuth();
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    sharedDocuments: 0,
    recentUploads: 0,
    totalViews: 0,
  });

  // ===========================
  // Data Fetching
  // ===========================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // Fetch user's documents
        const documentsResponse = await ApiGateway("/document-metadata", {
          headers: { Authorization: token },
        });

        // Fetch shared documents
        const sharedResponse = await ApiGateway.get(
          "/document-metadata/shared",
          {
            headers: { Authorization: token },
          }
        );

        if (documentsResponse.data) {
          setDocuments(documentsResponse.data);
          setStats((prev) => ({
            ...prev,
            totalDocuments: documentsResponse.data.length,
            recentUploads: documentsResponse.data.filter((doc: IDocument) => {
              const docDate = new Date(doc.createdAt);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return docDate > weekAgo;
            }).length,
          }));
        }

        if (sharedResponse.data) {
          setStats((prev) => ({
            ...prev,
            sharedDocuments: sharedResponse.data.length,
          }));
        }

        // Calculate total views (mock data for now)
        setStats((prev) => ({
          ...prev,
          totalViews: Math.floor(Math.random() * 1000) + 500,
        }));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getToken]);

  // ===========================
  // Render Component
  // ===========================
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Document Dashboard
          </h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "User"}! Here&apos;s your document
            overview.
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Documents Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.totalDocuments}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.recentUploads} uploaded this week
            </p>
          </CardContent>
        </Card>

        {/* Shared Documents Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Shared Documents
            </CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.sharedDocuments}
            </div>
            <p className="text-xs text-muted-foreground">
              Documents shared with you
            </p>
          </CardContent>
        </Card>

        {/* Recent Uploads Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Uploads
            </CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.recentUploads}
            </div>
            <p className="text-xs text-muted-foreground">
              Uploaded in the last 7 days
            </p>
          </CardContent>
        </Card>

        {/* Total Views Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.totalViews}
            </div>
            <p className="text-xs text-muted-foreground">
              All-time document views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overview and Recent Documents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Overview Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Document Activity Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>

        {/* Recent Documents List */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-muted-foreground">
                  Loading...
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  No documents yet. Upload your first document!
                </div>
              ) : (
                documents.slice(0, 5).map((doc) => (
                  <div key={doc._id} className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/documents/${doc._id}?url=${doc.url}`}
                        className="text-sm font-medium hover:text-blue-600 block truncate max-w-[200px] sm:max-w-[250px] md:max-w-[300px]"
                        title={doc.title}
                      >
                        {doc.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(doc.updatedAt || doc.createdAt),
                          "MMM d, yyyy"
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Document Statistics */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Document Activity Trends</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <DocumentStats />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/documents">
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <FileText className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">View All Documents</span>
              </div>
            </Link>
            <Link href="/dashboard/documents">
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <Upload className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Upload New Document</span>
              </div>
            </Link>
            <Link href="/dashboard/notifications">
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <MessageCircle className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium">
                  View Notifications (
                  {notifications.filter((n) => !n.read).length})
                </span>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
