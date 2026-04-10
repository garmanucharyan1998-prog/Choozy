import { useEffect } from "react";

/**
 * Placeholder for pages that are not yet implemented.
 * Sets document.title and renders a centered stub section.
 */
const ComingSoon = ({ title }) => {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} — Choozy`;
    return () => {
      document.title = prev;
    };
  }, [title]);

  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] gap-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-navy">{title}</h1>
      <p className="text-gray-400 text-base">Page is coming soon.</p>
    </section>
  );
};

export default ComingSoon;
