import React, { useEffect, useState } from "react";
import { 
  Bookmark, 
  X, 
  BarChart3, 
  Undo2, 
  Trash2,
  BookMarked,
  Clock
} from 'lucide-react';

interface Bookmark {
  title: string;
  timestamp: number;
}

interface UndoState {
  bookmark: Bookmark;
  show: boolean;
}

interface BookmarksListProps {
  theme: "dark" | "light";
  fontSize: "sm" | "md" | "lg";
  onViewBookmark: (title: string) => void;
}

const BookmarksList: React.FC<BookmarksListProps> = ({ 
  theme, 
  fontSize,
  onViewBookmark 
}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [undoState, setUndoState] = useState<UndoState | null>(null);

  useEffect(() => {
    loadBookmarks();
  }, []);

  useEffect(() => {
    if (undoState?.show) {
      const timer = setTimeout(() => {
        setUndoState(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [undoState]);

  const loadBookmarks = async () => {
    const store = await chrome.storage.local.get("bookmarks");
    const arr: Bookmark[] = store.bookmarks || [];
    // Sort by newest first
    setBookmarks(arr.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleRemoveBookmark = async (bookmark: Bookmark) => {
    const updatedBookmarks = bookmarks.filter((b) => b.title !== bookmark.title);
    setBookmarks(updatedBookmarks);
    await chrome.storage.local.set({ bookmarks: updatedBookmarks });
    
    // Show undo notification
    setUndoState({ bookmark, show: true });
  };

  const handleUndo = async () => {
    if (!undoState) return;
    
    const restoredBookmarks = [...bookmarks, undoState.bookmark].sort(
      (a, b) => b.timestamp - a.timestamp
    );
    setBookmarks(restoredBookmarks);
    await chrome.storage.local.set({ bookmarks: restoredBookmarks });
    setUndoState(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      calendar: 'persian',
    };
    return new Intl.DateTimeFormat('fa-IR', options).format(date);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Undo Notification */}
      {undoState?.show && (
        <div className={`mb-3 p-3 rounded-md border-2 flex items-center justify-between animate-slideIn ${
          theme === "dark" 
            ? "bg-red-900/30 border-red-500 text-red-200" 
            : "bg-red-100 border-red-400 text-red-800"
        }`}>
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            <span className="text-sm">
              کتاب "{undoState.bookmark.title}" حذف شد
            </span>
          </div>
          <button
            onClick={handleUndo}
            className="px-3 py-1.5 text-sm rounded-md bg-orange-500 hover:bg-orange-400 text-white transition-colors flex items-center gap-1.5"
          >
            <Undo2 className="w-4 h-4" />
            بازگردانی
          </button>
        </div>
      )}

      {/* Bookmarks List */}
      <div className="flex-1 overflow-y-auto">
        {bookmarks.length === 0 ? (
          <div className="text-center mt-20">
            <BookMarked className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg">هنوز کتابی نشان‌گذاری نشده است</p>
            <p className="text-gray-400 text-sm mt-2">
              برای ذخیره کتاب‌های مورد علاقه، دکمه "ذخیره کتاب" را در صفحه تحلیل کلیک کنید
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark, index) => (
              <div
                key={`${bookmark.title}-${bookmark.timestamp}`}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                  theme === "dark"
                    ? "bg-gray-800/50 border-orange-500/40 hover:border-orange-500"
                    : "bg-orange-50 border-orange-300 hover:border-orange-400"
                }`}
                style={{
                  animation: `fadeIn 0.3s ease-in ${index * 0.05}s backwards`
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <Bookmark className="w-5 h-5 flex-shrink-0 text-orange-400 mt-0.5" />
                      <h3 className="font-semibold text-lg text-orange-400 break-words leading-tight">
                        {bookmark.title}
                      </h3>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs mt-1 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(bookmark.timestamp)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => onViewBookmark(bookmark.title)}
                      className="px-3 py-2 text-sm rounded-md bg-orange-500 hover:bg-orange-400 text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
                      title="مشاهده تحلیل"
                    >
                      <BarChart3 className="w-4 h-4" />
                      تحلیل
                    </button>
                    <button
                      onClick={() => handleRemoveBookmark(bookmark)}
                      className={`px-3 py-2 text-sm rounded-md border-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                        theme === "dark"
                          ? "border-red-500 text-red-400 hover:bg-red-500/20"
                          : "border-red-400 text-red-600 hover:bg-red-100"
                      }`}
                      title="حذف نشان"
                    >
                      <X className="w-4 h-4" />
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {bookmarks.length > 0 && (
        <div className={`mt-3 pt-3 border-t text-center text-sm flex items-center justify-center gap-2 ${
          theme === "dark" 
            ? "border-gray-700 text-gray-400" 
            : "border-gray-300 text-gray-600"
        }`}>
          <BookMarked className="w-4 h-4" />
          تعداد کتاب‌های ذخیره شده: {bookmarks.length}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BookmarksList;
