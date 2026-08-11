const NotificationFeedCard = ({ title, timeLabel, body, headingLevel = 3 }) => {
  const HeadingTag = headingLevel === 4 ? "h4" : "h3";

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-[#e2e8f3] bg-[#eef1f6] p-3.5 text-start shadow-[0_1px_0_rgba(0,0,0,0.03)] sm:rounded-[10px] sm:border-0 sm:p-4 md:p-5 sm:shadow-none">
      <div className="flex items-start justify-between gap-3 border-b border-[#d9dfea] pb-3">
        <HeadingTag className="min-w-0 flex-1 text-sm font-bold leading-snug text-navy sm:text-base">
          {title}
        </HeadingTag>
        {/* A timestamp is a <time>, not a styled span. */}
        <time className="shrink-0 whitespace-nowrap text-xs font-normal tabular-nums text-navy sm:text-sm">
          {timeLabel}
        </time>
      </div>
      <p className="m-0 text-[13px] leading-relaxed text-navy sm:text-sm md:text-[15px]">{body}</p>
    </article>
  );
};

export default NotificationFeedCard;
