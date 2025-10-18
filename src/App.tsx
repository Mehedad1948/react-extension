import React, { useEffect, useState, useCallback } from "react";
import { prompt } from "./constatnts/prompt";
import BookmarksList from './components/BookmarksList';
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  CornerUpRight,
  Sun,
  Moon,
  RefreshCw,
  Type
} from 'lucide-react';

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = "AIzaSyCubVc7Xso_Cr6ebxnFRPSwXW51lewGmVQ";

interface Bookmark {
  title: string;
  timestamp: number;
}

const FONT_SIZES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const App: React.FC = () => {
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState<keyof typeof FONT_SIZES>("md");
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  /*--------------------------------------
   * Load stored preferences (theme, font)
   *------------------------------------*/
  useEffect(() => {
    chrome.storage.local.get(["theme", "fontSize", "lastSelectedBook"], async (res) => {
      const themeStored = res.theme || "dark";
      const fontStored = res.fontSize || "md";
      setTheme(themeStored);
      setFontSize(fontStored);

      const title = res.lastSelectedBook;
      if (title) {
        setBookTitle(title);
        const store = await chrome.storage.local.get("bookmarks");
        const arr: Bookmark[] = store.bookmarks || [];
        setIsBookmarked(arr.some((b) => b.title === title));
      }
      setInitializing(false);
    });
  }, []);

  /*--------------------------------------
   * Summarization
   *------------------------------------*/
  const summarize = useCallback(async (title?: string) => {
    const targetTitle = title || bookTitle;
    if (!targetTitle) return;

    setSummary(null);
    setError(null);
    setLoading(true);
    setHasAttemptedLoad(true);

    const fullPrompt = prompt(targetTitle);
    console.groupCollapsed("🔍 Gemini summarize()");
    console.log("Prompt text:", fullPrompt);

    try {
      const payload = { contents: [{ role: "user", parts: [{ text: fullPrompt }] }] };
      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Gemini API error ${res.status}`);
      const data = await res.json();
      const raw: string =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        data?.candidates?.[0]?.output ??
        "[No summary returned]";

      // Remove all line breaks and clean up the content
      const cleaned = raw
        .replace(new RegExp("<title>.*?</title>", "gis"), "")
        .replace(new RegExp("```html|```", "gi"), "")
        .replace(/\n/g, " ") // Remove all \n breaks
        .replace(/\s{2,}/g, " ") // Replace multiple spaces with single space
        .replace(/^[\s]+|[\s]+$/g, ""); // Trim leading/trailing spaces

      setSummary(cleaned);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "خطا در خلاصه‌سازی");
    } finally {
      console.groupEnd();
      setLoading(false);
    }
  }, [bookTitle]);

  useEffect(() => {
    if (bookTitle && !showBookmarks && !initializing) {
      summarize();
    }
  }, [bookTitle, showBookmarks, initializing, summarize]);

  /*--------------------------------------
   * Theme toggle (with save)
   *------------------------------------*/
  const toggleTheme = async () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    await chrome.storage.local.set({ theme: next });
  };

  /*--------------------------------------
   * Font size change (with save)
   *------------------------------------*/
  const handleFontChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as keyof typeof FONT_SIZES;
    setFontSize(val);
    await chrome.storage.local.set({ fontSize: val });
  };

  /*--------------------------------------
   * Bookmark toggle
   *------------------------------------*/
  const handleBookmark = async () => {
    if (!bookTitle) return;
    const store = await chrome.storage.local.get("bookmarks");
    const arr: Bookmark[] = store.bookmarks || [];
    let updated: Bookmark[];

    if (arr.some((b) => b.title === bookTitle)) {
      updated = arr.filter((b) => b.title !== bookTitle);
      setIsBookmarked(false);
      console.info("[Bookmark] Removed:", bookTitle);
    } else {
      updated = [...arr, { title: bookTitle, timestamp: Date.now() }];
      setIsBookmarked(true);
      console.info("[Bookmark] Added:", bookTitle);
    }

    await chrome.storage.local.set({ bookmarks: updated });
  };

  /*--------------------------------------
   * Navigate to book analysis from bookmark
   *------------------------------------*/
  const handleViewBookmark = async (title: string) => {
    setBookTitle(title);
    setHasAttemptedLoad(false); // Reset for new book
    await chrome.storage.local.set({ lastSelectedBook: title });
    const store = await chrome.storage.local.get("bookmarks");
    const arr: Bookmark[] = store.bookmarks || [];
    setIsBookmarked(arr.some((b) => b.title === title));
    setShowBookmarks(false);
    summarize(title);
  };

  const fontClass = FONT_SIZES[fontSize];
  const rootClasses = theme === "dark" ? "theme-dark" : "theme-light";
  const shouldShowRetryButton = error || (!loading && !summary && hasAttemptedLoad);

  // Show loading during initialization
  if (initializing) {
    return (
      <div className={`${rootClasses} min-w-[600px] min-h-[500px] w-dvw h-dvh flex items-center justify-center ${fontClass}`} dir="rtl">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }
  const logoUrl = chrome.runtime.getURL("logo192.png");
  
  return (
    <div className={`${rootClasses} group w-dvw h-dvh flex flex-col p-5 rounded-md transition-colors duration-300 ${fontClass}`} dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-orange-500 font-bold text-lg flex items-center gap-2">
            <img src={logoUrl} className='w-6' />
            بررسی کتاب
          </h1>
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className="px-3 py-1.5 text-sm rounded-md border border-orange-500 bg-orange-500 text-white hover:bg-orange-400 transition-colors flex items-center gap-1.5"
          >
            {showBookmarks ? (
              <>
                <CornerUpRight className="w-4 h-4" />
                بازگشت
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                لیست نشان‌ها
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Font Size Control */}
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-gray-500" />
            <select
              value={fontSize}
              onChange={handleFontChange}
              className="text-sm rounded-md border border-gray-500 px-2 py-1 bg-transparent"
              title="اندازه فونت"
            >
              <option value="sm">کوچک</option>
              <option value="md">متوسط</option>
              <option value="lg">بزرگ</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-500 transition-colors flex items-center gap-1.5"
            title={theme === "dark" ? "تم روشن" : "تم تاریک"}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4" />
                روشن
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                تاریک
              </>
            )}
          </button>
        </div>
      </div>

      {showBookmarks ? (
        <BookmarksList
          theme={theme}
          fontSize={fontSize}
          onViewBookmark={handleViewBookmark}
        />
      ) : bookTitle ? (
        <>
          <div className="flex justify-between items-center mb-3 gap-3">
            <p className="font-semibold text-xl text-gray-800 group-[.theme-dark]:text-orange-500 break-words flex-1 text-right">
              {bookTitle}
            </p>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Retry Button - Only show when needed */}
              {shouldShowRetryButton && (
                <button
                  onClick={() => summarize()}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-md text-sm bg-orange-500 hover:bg-orange-400 text-white flex items-center gap-1.5 transition-all ${loading ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  title="دریافت مجدد تحلیل"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  دریافت دوباره
                </button>
              )}

              {/* Bookmark Button */}
              <button
                onClick={handleBookmark}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors flex items-center gap-1.5 whitespace-nowrap ${isBookmarked
                  ? "bg-green-600 border-green-400 text-white"
                  : "bg-gray-200 border-gray-400 hover:opacity-80"
                  }`}
                title={isBookmarked ? "حذف از نشان‌ها" : "افزودن به نشان‌ها"}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    ذخیره شده
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    ذخیره کتاب
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto border rounded-md p-4 leading-relaxed border-orange-500">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
                <p>در حال دریافت خلاصه…</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-red-500">
                <div className="text-center">
                  <p className="text-lg font-semibold mb-2">خطا در دریافت اطلاعات</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            ) : summary ? (
              <div
                className="border border-orange-500 rounded-md p-3
                    [&>article]:mb-2 [&>h2]:mt-2 [&>h2]:mb-2 [&>h2]:font-bold [&>h2]:text-orange-400
                    [&>p]:mb-2 [&>p]:leading-relaxed
                    [&>ul]:mr-4 [&>ul]:mb-2 [&>li]:mb-1
                    [&>strong]:text-orange-300 [&>strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
                <BookOpen className="w-12 h-12 text-gray-400" />
                <p>خلاصه‌ای یافت نشد</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
          <BookOpen className="w-16 h-16 text-gray-400" />
          <p className="text-center text-lg">
            روی دکمهٔ خلاصه در صفحهٔ طاقچه کلیک کنید
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
