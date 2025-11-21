import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getMasjidById,
  getMasjidAdmins,
  getMasjidTvDisplays,
  formatMasjidAddress,
} from "@/services/masjidService";
import {
  getTodayPrayerTimes,
  type MalaysianZone,
} from "@masjid-suite/prayer-times/server";
import type { MasjidAdmin } from "@masjid-suite/shared-types";
import { getTvDisplayUrlForDisplay } from "@masjid-suite/shared-types";

interface MasjidPageProps {
  params: Promise<{ id: string }>;
}

const SITE_NAME = "E-Masjid.My";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://emasjid.my";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: MasjidPageProps): Promise<Metadata> {
  const { id } = await params;
  const masjid = await getMasjidById(id);

  if (!masjid) {
    return {
      title: "Masjid Tidak Ditemui",
    };
  }

  const title = `${masjid.name} - ${SITE_NAME}`;
  const description =
    masjid.description ||
    `Maklumat terperinci tentang ${masjid.name} - alamat, waktu solat, dan hubungan`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ms_MY",
      siteName: SITE_NAME,
      url: `${SITE_URL}/masjid/${id}`,
    },
  };
}

// ISR - Revalidate every hour for prayer times
export const revalidate = 3600;

export default async function MasjidPage({ params }: MasjidPageProps) {
  const { id } = await params;
  const masjid = await getMasjidById(id);

  if (!masjid) {
    notFound();
  }

  // Fetch prayer times and admins in parallel
  const [prayerTimes, admins, tvDisplays] = await Promise.all([
    masjid.jakim_zone_code
      ? getTodayPrayerTimes(id, masjid.jakim_zone_code as MalaysianZone).catch(
          () => null
        )
      : Promise.resolve(null),
    getMasjidAdmins(id),
    getMasjidTvDisplays(id),
  ]);

  const getStatusBadge = (status: string) => {
    const styles =
      {
        active: "bg-green-100 text-green-800",
        inactive: "bg-red-100 text-red-800",
        pending_verification: "bg-yellow-100 text-yellow-800",
      }[status] || "bg-gray-100 text-gray-800";

    const labels =
      {
        active: "Aktif",
        inactive: "Tidak Aktif",
        pending_verification: "Menunggu Pengesahan",
      }[status] || status;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}
      >
        {labels}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {masjid.name}
                </h1>
                {masjid.registration_number && (
                  <p className="text-sm text-gray-500">
                    {masjid.registration_number}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getStatusBadge(masjid.status)}
              {masjid.capacity && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Kapasiti: {masjid.capacity}
                </span>
              )}
            </div>
          </div>
        </div>

        {masjid.description && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Tentang Masjid
            </h2>
            <p className="text-gray-700">{masjid.description}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Location */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Hubungi & Lokasi
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {masjid.phone_number && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Telefon
                      </p>
                      <a
                        href={`tel:${masjid.phone_number}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {masjid.phone_number}
                      </a>
                    </div>
                  </div>
                )}

                {masjid.email && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <a
                        href={`mailto:${masjid.email}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {masjid.email}
                      </a>
                    </div>
                  </div>
                )}

                {masjid.website_url && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Laman Web
                      </p>
                      <a
                        href={masjid.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {masjid.website_url}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Alamat</p>
                    <p className="text-sm text-gray-700">
                      {formatMasjidAddress(masjid.address)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Committee Members */}
          {admins.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Jawatankuasa
              </h2>
              <div className="space-y-3">
                {admins.map((admin: MasjidAdmin) => (
                  <div
                    key={admin.user_id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {admin.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {admin.full_name}
                      </p>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                      {admin.phone_number && (
                        <p className="text-sm text-gray-600">
                          {admin.phone_number}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TV Displays */}
          {tvDisplays.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Paparan TV
              </h2>
              <div className="space-y-3">
                {tvDisplays.map((display) => (
                  <div
                    key={display.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {display.display_name}
                        </p>
                        {display.location_description && (
                          <p className="text-sm text-gray-600">
                            📍 {display.location_description}
                          </p>
                        )}
                        {display.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {display.description}
                          </p>
                        )}
                        <a
                          href={getTvDisplayUrlForDisplay(display.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <span>Lihat Paparan</span>
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
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Prayer Times */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">
                Waktu Solat
              </h2>
            </div>

            {prayerTimes ? (
              <>
                <p className="text-xs text-gray-500 mb-4">
                  {new Date(prayerTimes.prayer_date).toLocaleDateString(
                    "ms-MY",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>

                <div className="space-y-2">
                  {[
                    { name: "Subuh", time: prayerTimes.fajr_time },
                    { name: "Syuruk", time: prayerTimes.sunrise_time },
                    { name: "Zohor", time: prayerTimes.dhuhr_time },
                    { name: "Asar", time: prayerTimes.asr_time },
                    { name: "Maghrib", time: prayerTimes.maghrib_time },
                    { name: "Isyak", time: prayerTimes.isha_time },
                  ].map((prayer) => (
                    <div
                      key={prayer.name}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm text-gray-700">
                        {prayer.name}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {prayer.time}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Sumber: {prayerTimes.source.replace("_", " ")}
                  {masjid.jakim_zone_code &&
                    ` (Zon: ${masjid.jakim_zone_code})`}
                  <br />
                  Kemaskini:{" "}
                  {new Date(prayerTimes.fetched_at).toLocaleString("ms-MY")}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Waktu solat akan dipaparkan apabila kod zon JAKIM dikonfigurasi
                untuk masjid ini.
              </p>
            )}
          </div>

          {/* Meta Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Maklumat
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-gray-400 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Dicipta</p>
                  <p className="text-sm text-gray-700">
                    {new Date(masjid.created_at).toLocaleDateString("ms-MY")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-gray-400 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Kemaskini Terakhir
                  </p>
                  <p className="text-sm text-gray-700">
                    {new Date(masjid.updated_at).toLocaleDateString("ms-MY")}
                  </p>
                </div>
              </div>

              {masjid.prayer_times_source && (
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Sumber Waktu Solat
                    </p>
                    <p className="text-sm text-gray-700">
                      {masjid.prayer_times_source === "jakim"
                        ? "JAKIM"
                        : masjid.prayer_times_source === "auto"
                          ? "Auto-detect"
                          : "Manual"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
