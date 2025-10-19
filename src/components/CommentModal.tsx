/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ApiGateway } from "@/shared/axios";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

interface Comment {
  _id: string;
  name: string;
  content: string;
  documentId: string;
  replies: number;
  createdAt?: Date;
  user: string;
}

interface CommentItemProps {
  comment: Comment;
  depth?: number;
}

interface CommentModalProps {
  isModalOpen: boolean;
  onClose: () => void;
  documentId: string;
}

function CommentItem({ comment, depth = 0 }: CommentItemProps) {
  const { getToken } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const handleReply = async () => {
    setIsPostingReply(true);
    try {
      const token = await getToken();
      const response = await ApiGateway.post(
        `/comment/`,
        {
          parentCommentId: comment._id,
          content: replyContent.trim(),
          documentId: comment.documentId,
        },
        {
          headers: { Authorization: token },
        }
      );
      if (response.data) {
        setReplies([...replies, response.data]);

        setReplyContent("");
        setShowReplyInput(false);
        setShowReplies(true);
      }
    } finally {
      setIsPostingReply(false);
    }
  };
  const handleShowReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
    setIsLoadingReplies(true);
    try {
      const token = await getToken();
      const response = await ApiGateway.get(
        `/comment/${comment.documentId}/${comment._id}/`,
        {
          headers: { Authorization: token },
        }
      );
      setReplies(response.data);
      setShowReplies(true);
    } finally {
      setIsLoadingReplies(false);
    }
  };
  return (
    <div
      className={`${
        depth > 0 ? "ml-8 border-l-2 border-border pl-4" : ""
      } mb-6`}
    >
      <div className="bg-card rounded-lg p-4 border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
            {comment?.user?.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-card-foreground">
            {comment.user ?? ""}
          </span>
          <span className="text-xs text-muted-foreground">
            {comment.createdAt
              ? new Date(comment.createdAt).toLocaleDateString()
              : ""}
          </span>
        </div>

        <p className="text-card-foreground mb-3 leading-relaxed">
          {comment.content}
        </p>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-xs"
          >
            Reply
          </Button>
          {Number(comment.replies) > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowReplies}
              className="text-xs"
              disabled={isLoadingReplies}
            >
              {isLoadingReplies ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  Loading...
                </>
              ) : (
                <>
                  {showReplies ? "Hide" : "Show"} Replies ({comment.replies})
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {showReplyInput && (
        <div className="mt-4 bg-muted/50 rounded-lg p-4 border">
          <div className="space-y-3">
            <Textarea
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="bg-background min-h-[80px]"
              disabled={isPostingReply}
            />
            <div className="flex gap-2">
              <Button onClick={handleReply} size="sm" disabled={isPostingReply}>
                {isPostingReply ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  "Post Reply"
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReplyInput(false)}
                disabled={isPostingReply}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showReplies && replies.length > 0 && (
        <div className="mt-4">
          {replies.map((reply) => (
            <CommentItem key={reply._id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentModal({
  isModalOpen,
  onClose,
  documentId,
}: CommentModalProps) {
  const { getToken } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const handleNewComment = async () => {
    setIsPostingComment(true);
    try {
      const token = await getToken();
      const response = await ApiGateway.post(
        "/comment/",
        {
          documentId,
          content: newCommentContent.trim(),
        },
        {
          headers: { Authorization: token },
        }
      );
      if (response.data) {
        setComments([response.data, ...comments]);
        setNewCommentContent("");
      }
    } finally {
      setIsPostingComment(false);
    }
  };
  useEffect(() => {
    const getComments = async () => {
      setIsLoadingComments(true);
      try {
        const token = await getToken();
        const response = await ApiGateway.get(`/comment/${documentId}/`, {
          headers: { Authorization: token },
        });
        setComments(response.data);
      } finally {
        setIsLoadingComments(false);
      }
    };
    getComments();
  }, [documentId, isModalOpen]);
  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Comments</DialogTitle>
          <DialogDescription>
            Join the conversation and share your thoughts
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
          {/* New Comment Form */}
          <div className="bg-card rounded-lg p-6 border mb-8">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">
              Add a Comment
            </h2>
            <div className="space-y-4">
              <Textarea
                placeholder="Share your thoughts..."
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                className="min-h-[100px]"
                disabled={isPostingComment}
              />
              <Button onClick={handleNewComment} disabled={isPostingComment}>
                {isPostingComment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  "Post Comment"
                )}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentItem key={comment._id} comment={comment} />
              ))}
            </div>
          )}

          {!isLoadingComments && comments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No comments yet. Be the first to start the conversation!
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
