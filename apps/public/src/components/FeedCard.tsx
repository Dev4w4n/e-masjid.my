import Link from "next/link";
import Image from "next/image";
import { ContentWithMasjid, generateSlug } from "@/services/contentService";
import PremiumBadge from "./PremiumBadge";

interface FeedCardProps {
  content: ContentWithMasjid;
  priority?: boolean;
}

export default function FeedCard({ content, priority = false }: FeedCardProps) {
  const slug = generateSlug(content.title, content.id);
  const imageUrl = content.thumbnail_url || content.url;

  // Format date - more social media style (relative time would be better)
  const createdDate = new Date(content.created_at);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60)
  );

  let timeAgo = "";
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60)
    );
    timeAgo = `${diffInMinutes} minit yang lalu`;
  } else if (diffInHours < 24) {
    timeAgo = `${diffInHours} jam yang lalu`;
  } else if (diffInHours < 168) {
    // Less than a week
    const diffInDays = Math.floor(diffInHours / 24);
    timeAgo = `${diffInDays} hari yang lalu`;
  } else {
    timeAgo = createdDate.toLocaleDateString("ms-MY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <article className="bg-white rounded shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden border border-gray-200 w-full">
      {/* Post Header - Masjid Info */}
      <div className="p-4 pb-3 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Masjid Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-lg flex-shrink-0">
              🕌
            </div>

            {/* Masjid Name & Location */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/masjid/${content.masjids.id}`}
                className="hover:underline"
              >
                <h3 className="font-semibold text-sm text-gray-900 truncate hover:text-blue-600 transition-colors">
                  {content.masjids.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="truncate">
                  {content.masjids.address.city},{" "}
                  {content.masjids.address.state}
                </span>
                <span>•</span>
                <time dateTime={content.created_at} className="text-gray-500">
                  {timeAgo}
                </time>
              </div>
            </div>
          </div>

          {/* Premium Badge */}
          {content.sponsorship_amount > 0 && (
            <div className="flex-shrink-0 ml-2">
              <PremiumBadge sponsorshipAmount={content.sponsorship_amount} />
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <Link href={`/iklan/${slug}`} className="block group">
        {/* Media Content - Open E Masjid style: Image first */}
        {content.type === "image" && imageUrl ? (
          <div
            className="relative w-full bg-gray-100"
            style={{ aspectRatio: "16/9" }}
          >
            <Image
              src={imageUrl}
              alt={content.title}
              fill
              className="object-cover group-hover:opacity-95 transition-opacity"
              sizes="(max-width: 768px) 100vw, 700px"
              loading={priority ? "eager" : "lazy"}
              priority={priority}
              quality={85}
              unoptimized
            />
          </div>
        ) : content.type === "youtube_video" ? (
          <div
            className="relative w-full bg-gradient-to-br from-blue-600 to-teal-400 flex items-center justify-center"
            style={{ aspectRatio: "16/9" }}
          >
            <div className="text-center">
              <div className="text-5xl mb-2">▶️</div>
              <p className="text-white text-sm font-medium">Video YouTube</p>
            </div>
          </div>
        ) : null}

        {/* Text Content */}
        <div className="p-4">
          <h2 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
            {content.title}
          </h2>

          {content.description && (
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {content.description}
            </p>
          )}
        </div>
      </Link>

      {/* Post Footer - Open E Masjid style action button */}
      <div className="px-4 pb-4">
        <Link
          href={`/iklan/${slug}`}
          className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span>Lihat Butiran</span>
          <svg
            className="ml-2 w-4 h-4"
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
        </Link>
      </div>
    </article>
  );
}
