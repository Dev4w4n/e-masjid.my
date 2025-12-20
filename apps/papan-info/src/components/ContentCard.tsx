import Link from "next/link";
import Image from "next/image";
import { ContentWithMasjid, generateSlug } from "@/services/contentService";
import PremiumBadge from "./PremiumBadge";

interface ContentCardProps {
  content: ContentWithMasjid;
  priority?: boolean;
}

export default function ContentCard({
  content,
  priority = false,
}: ContentCardProps) {
  const slug = generateSlug(content.title, content.id);
  const imageUrl = content.thumbnail_url || content.url;

  // Format date
  const createdDate = new Date(content.created_at).toLocaleDateString("ms-MY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Truncate description
  const truncatedDescription = content.description
    ? content.description.length > 150
      ? content.description.substring(0, 150) + "..."
      : content.description
    : "";

  return (
    <article className="bg-white rounded shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden border border-gray-200 flex flex-col h-full">
      {/* Image - Open E Masjid style */}
      <div className="relative h-48 bg-gray-100">
        {content.type === "image" && imageUrl ? (
          <Image
            src={imageUrl}
            alt={content.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            quality={85}
            unoptimized
          />
        ) : content.type === "youtube_video" ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-teal-400">
            <div className="text-center">
              <span className="text-5xl" role="img" aria-label="Video">
                ▶️
              </span>
              <p className="text-white text-sm font-medium mt-2">
                Video YouTube
              </p>
            </div>
          </div>
        ) : null}

        {/* Premium Badge Overlay */}
        {content.sponsorship_amount > 0 && (
          <div className="absolute top-2 right-2">
            <PremiumBadge sponsorshipAmount={content.sponsorship_amount} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2 leading-snug">
          {content.title}
        </h3>

        {truncatedDescription && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
            {truncatedDescription}
          </p>
        )}

        {/* Masjid Info */}
        <div className="space-y-1 mt-auto">
          <div className="flex items-center text-sm text-gray-700">
            <span className="mr-1.5">🕌</span>
            <Link
              href={`/masjid/${content.masjids.id}`}
              className="font-semibold truncate hover:text-blue-600 hover:underline transition-colors"
            >
              {content.masjids.name}
            </Link>
          </div>

          <div className="flex items-center text-xs text-gray-500">
            <span className="mr-1.5">📍</span>
            <span className="truncate">
              {content.masjids?.address?.city},{" "}
              {content.masjids?.address?.state}
            </span>
          </div>

          {/* Date */}
          <div className="text-xs text-gray-400 mt-2">{createdDate}</div>
        </div>
      </div>

      {/* Action Button - Open E Masjid style */}
      <div className="px-4 pb-4">
        <Link
          href={`/iklan/${slug}`}
          className="block w-full text-center px-4 py-2 bg-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Lihat Butiran
        </Link>
      </div>
    </article>
  );
}
