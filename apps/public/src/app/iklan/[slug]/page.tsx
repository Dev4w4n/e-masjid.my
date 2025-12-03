import { notFound } from "next/navigation";
import Image from "next/image";
import {
  getContentBySlug,
  getAllActiveContent,
} from "@/services/contentService";
import {
  generateMetadata as generateSEOMetadata,
  generateStructuredData,
} from "@/lib/seo";
import PremiumBadge from "@/components/PremiumBadge";
import type { Metadata } from "next";

// Required for Cloudflare Pages deployment
export const runtime = "edge";

// Note: Edge Runtime doesn't support generateStaticParams
// Content will be rendered on-demand at the edge

// Generate dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContentBySlug(slug);

  if (!content) {
    return {
      title: "Tidak Dijumpai",
    };
  }

  return generateSEOMetadata(content);
}

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getContentBySlug(slug);

  if (!content) {
    notFound();
  }

  // Generate Product structured data
  const productData = generateStructuredData("Product", {
    name: content.title,
    description: content.description || "",
    image: content.thumbnail_url || content.url,
    offers: {
      price:
        content.sponsorship_amount > 0
          ? content.sponsorship_amount.toString()
          : "0",
      priceCurrency: "MYR",
    },
  });

  const createdDate = new Date(content.created_at).toLocaleDateString("ms-MY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productData) }}
      />

      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-islamic-green-800">
              {content.title}
            </h1>
            {content.sponsorship_amount > 0 && (
              <PremiumBadge sponsorshipAmount={content.sponsorship_amount} />
            )}
          </div>

          {/* Masjid Info */}
          <div className="flex flex-col gap-2 text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">🕌</span>
              <span className="font-medium">{content.masjids.name}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📍</span>
              <span>
                {content.masjids.address.city}, {content.masjids.address.state}
              </span>
            </div>
            <div className="text-sm text-gray-500">{createdDate}</div>
          </div>
        </div>

        {/* Content */}
        <div className="card-islamic p-6 mb-6">
          {content.type === "image" && content.url && (
            <div className="relative h-96 mb-6">
              <Image
                src={content.url}
                alt={content.title}
                fill
                className="object-contain"
                priority
              />
            </div>
          )}

          {content.type === "youtube_video" && content.url && (
            <div className="aspect-video mb-6">
              <iframe
                src={content.url.replace("watch?v=", "embed/")}
                title={content.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded"
              />
            </div>
          )}

          {content.description && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {content.description}
              </p>
            </div>
          )}
        </div>

        {/* Contact Info */}
        {(content.contact_number || content.contact_email) && (
          <div className="card-islamic p-6">
            <h2 className="text-xl font-semibold text-islamic-green-800 mb-4">
              Maklumat Hubungan
            </h2>
            <div className="space-y-2">
              {content.contact_number && (
                <div className="flex items-center">
                  <span className="mr-2">📞</span>
                  <a
                    href={`tel:${content.contact_number}`}
                    className="text-islamic-blue-600 hover:underline"
                  >
                    {content.contact_number}
                  </a>
                </div>
              )}
              {content.contact_email && (
                <div className="flex items-center">
                  <span className="mr-2">✉️</span>
                  <a
                    href={`mailto:${content.contact_email}`}
                    className="text-islamic-blue-600 hover:underline"
                  >
                    {content.contact_email}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
