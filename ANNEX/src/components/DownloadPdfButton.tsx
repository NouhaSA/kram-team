"use client";

import { useState } from "react";

export function DownloadPdfButton({
  className = "",
  label = "Télécharger l'offre PDF",
  href = "/api/franchise-pdf",
  filename = "Offre-Franchise-Kram-Team.pdf",
}: {
  className?: string;
  label?: string;
  href?: string;
  filename?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    try {
      setLoading(true);
      const res = await fetch(href);
      if (!res.ok) throw new Error("PDF unavailable");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.location.href = href;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className={className}
    >
      <span className="inline-flex items-center gap-2">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {loading ? "Génération…" : label}
      </span>
    </button>
  );
}
