import React, { useState, useEffect, useRef } from "react";
import type { Load, Comment } from "../types/index";
import { getComments, createComment } from "../lib/api";

interface LoadDetailModalProps {
  load: Load | null;
  isOpen: boolean;
  onClose: () => void;
}

const LoadDetailModal: React.FC<LoadDetailModalProps> = ({
  load,
  isOpen,
  onClose,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && load) {
      fetchComments();
    } else {
      setComments([]);
      setNewComment("");
    }
  }, [isOpen, load]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const fetchComments = async () => {
    if (!load) return;
    setIsLoadingComments(true);
    try {
      const data = await getComments(load.id);
      setComments(data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!load || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const comment = await createComment(load.id, newComment.trim());
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to create comment:", err);
      alert("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !load) return null;

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    transferred: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {load.client_name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              #{load.client_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Load Details */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                statusColors[load.status] || statusColors.pending
              }`}
            >
              {load.status.replace("_", " ")}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Assigned To</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {load.assigned_to_name || "Unassigned"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Employee Count</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {load.employee_count ?? 1}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {new Date(load.created_at).toLocaleString()}
            </span>
          </div>

          {load.created_by_name && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Created By</span>
              <span className="text-sm text-gray-900 dark:text-white">
                {load.created_by_name}
              </span>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-6 py-3 border-b border-gray-200 dark:border-neutral-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Comments ({comments.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-3 space-y-3 min-h-[150px] max-h-[250px]">
            {isLoadingComments ? (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                No comments yet
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.user_name || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>

          {/* Add Comment Form */}
          <form
            onSubmit={handleSubmitComment}
            className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? "..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoadDetailModal;
