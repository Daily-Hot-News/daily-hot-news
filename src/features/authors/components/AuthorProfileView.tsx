"use client";

import { useState } from "react";
import { EditAuthorModal } from "./EditAuthorModal";
import Link from "next/link";

interface AuthorProfileViewProps {
  authorProfile: {
    userId: string;
    displayName: string;
    slug: string;
    jobTitle?: string | null;
    bio?: string | null;
    user: {
      image?: string | null;
      email: string;
      articles: Array<{
        id: string;
        title: string;
        slug: string;
        createdAt: Date;
      }>;
    };
  };
  isOwner: boolean;
}

export function AuthorProfileView({
  authorProfile,
  isOwner,
}: AuthorProfileViewProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const articleCount = authorProfile.user.articles.length;

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <div className="h-35 sm:h-40 relative overflow-hidden" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main profile card (overlapping banner) */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm p-6 sm:p-8 -mt-20 relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            {/* Left: profile picture & main info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              {/* Profile picture */}
              <div className="relative group">
                {authorProfile.user.image ? (
                  <img
                    src={authorProfile.user.image}
                    alt={authorProfile.displayName}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white shadow-md ring-1 ring-zinc-200/50"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white font-bold text-4xl flex items-center justify-center border-4 border-white shadow-md ring-1 ring-zinc-200/50 uppercase">
                    {authorProfile.displayName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Author details */}
              <div className="space-y-1.5 w-full min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-lg font-extrabold text-zinc-900 tracking-tight">
                    {authorProfile.displayName}
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60">
                    AUTHOR
                  </span>
                </div>

                <p className="text-xs font-semibold text-blue-600">
                  {authorProfile.jobTitle || "Jurnalis & Penulis Opini"}
                </p>

                <div className="space-y-2 w-full min-w-0">
                  <p className="text-sm text-zinc-600 leading-relaxed max-w-xl pt-1 wrap-break-word whitespace-pre-line">
                    {authorProfile.bio ||
                      "Penulis ini belum membagikan bio singkat mengenai dirinya."}
                  </p>
                </div>

                {/* Quick info */}
                <div className="flex items-center justify-center sm:justify-start gap-4 pt-3 text-xs text-zinc-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                    <span>{articleCount} Artikel Dipublikasikan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: actions */}
            {isOwner && (
              <div className="flex sm:flex-col justify-center gap-2 pt-2 md:pt-0">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 md:px-3 md:py-2 px-4 py-3 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-all duration-200 cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profil Author
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Articles section header */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
                Artikel Oleh {authorProfile.displayName}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                Kumpulan karya tulis dan rilis berita yang telah diterbitkan
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full border border-zinc-200">
              {articleCount} Total
            </span>
          </div>

          {/* Articles list */}
          {articleCount === 0 ? (
            /* Empty state */
            <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200/80 shadow-xs">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-zinc-900">
                Belum ada artikel dipublikasikan
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Penulis ini belum menerbitkan artikel apapun saat ini. Silakan
                periksa kembali nanti.
              </p>
            </div>
          ) : (
            /* Article cards grid */
            <div className="grid gap-4">
              {authorProfile.user.articles.map((article) => (
                <article
                  key={article.id}
                  className="group bg-white rounded-2xl p-5 border border-zinc-200/80 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    {/* Title */}
                    <Link
                      href={`/articles/${article.slug}`}
                      className="text-base sm:text-lg font-bold text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {article.title}
                    </Link>

                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(article.createdAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Right arrow icon */}
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-zinc-50 group-hover:bg-blue-50 text-zinc-400 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                    <svg
                      className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit author modal */}
      <EditAuthorModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        authorProfile={authorProfile}
      />
    </div>
  );
}
