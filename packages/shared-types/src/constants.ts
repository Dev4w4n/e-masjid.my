import { z } from "zod";

/**
 * JAKIM API zone information
 * Reference data for validating jakim_zone_id
 */
export interface JakimZone {
  /** Zone identifier (e.g., "WLY01") */
  id: string;

  /** Zone name in Bahasa Malaysia */
  name: string;

  /** State or region */
  state: string;

  /** Whether zone is currently active in JAKIM API */
  is_active: boolean;
}

/**
 * Commonly used JAKIM zones for validation
 */
export const JAKIM_ZONES: readonly JakimZone[] = [
  {
    id: "JHR01",
    name: "Pulau Aur dan Pulau Pemanggil",
    state: "Johor",
    is_active: true,
  },
  {
    id: "JHR02",
    name: "Johor Bharu, Kota Tinggi, Mersing",
    state: "Johor",
    is_active: true,
  },
  { id: "JHR03", name: "Kluang, Pontian", state: "Johor", is_active: true },
  {
    id: "JHR04",
    name: "Batu Pahat, Muar, Segamat, Gemas Johor",
    state: "Johor",
    is_active: true,
  },
  {
    id: "KDH01",
    name: "Kota Setar, Kubang Pasu, Pokok Sena (Daerah Kecil)",
    state: "Kedah",
    is_active: true,
  },
  {
    id: "KDH02",
    name: "Kuala Muda, Yan, Pendang",
    state: "Kedah",
    is_active: true,
  },
  { id: "KDH03", name: "Padang Terap, Sik", state: "Kedah", is_active: true },
  { id: "KDH04", name: "Baling", state: "Kedah", is_active: true },
  {
    id: "KDH05",
    name: "Bandar Baharu, Kulim",
    state: "Kedah",
    is_active: true,
  },
  { id: "KDH06", name: "Langkawi", state: "Kedah", is_active: true },
  { id: "KDH07", name: "Gunung Jerai", state: "Kedah", is_active: true },
  {
    id: "KTN01",
    name: "Bachok, Kota Bharu, Machang, Pasir Mas, Pasir Puteh, Tanah Merah, Tumpat, Kuala Krai, Mukim Chiku",
    state: "Kelantan",
    is_active: true,
  },
  {
    id: "KTN03",
    name: "Gua Musang (Daerah Galas Dan Bertam), Jeli",
    state: "Kelantan",
    is_active: true,
  },
  {
    id: "MLK01",
    name: "SELURUH NEGERI MELAKA",
    state: "Melaka",
    is_active: true,
  },
  {
    id: "NGS01",
    name: "Tampin, Jempol",
    state: "Negeri Sembilan",
    is_active: true,
  },
  {
    id: "NGS02",
    name: "Jelebu, Kuala Pilah, Port Dickson, Rembau, Seremban",
    state: "Negeri Sembilan",
    is_active: true,
  },
  { id: "PHG01", name: "Pulau Tioman", state: "Pahang", is_active: true },
  {
    id: "PHG02",
    name: "Kuantan, Pekan, Rompin, Muadzam Shah",
    state: "Pahang",
    is_active: true,
  },
  {
    id: "PHG03",
    name: "Jerantut, Temerloh, Maran, Bera, Chenor, Jengka",
    state: "Pahang",
    is_active: true,
  },
  {
    id: "PHG04",
    name: "Bentong, Lipis, Raub",
    state: "Pahang",
    is_active: true,
  },
  {
    id: "PHG05",
    name: "Genting Sempah, Janda Baik, Bukit Tinggi",
    state: "Pahang",
    is_active: true,
  },
  {
    id: "PHG06",
    name: "Cameron Highlands, Genting Higlands, Bukit Fraser",
    state: "Pahang",
    is_active: true,
  },
  {
    id: "PLS01",
    name: "Kangar, Padang Besar, Arau",
    state: "Perlis",
    is_active: true,
  },
  {
    id: "PNG01",
    name: "Seluruh Negeri Pulau Pinang",
    state: "Pulau Pinang",
    is_active: true,
  },
  {
    id: "PRK01",
    name: "Tapah, Slim River, Tanjung Malim",
    state: "Perak",
    is_active: true,
  },
  {
    id: "PRK02",
    name: "Kuala Kangsar, Sg. Siput (Daerah Kecil), Ipoh, Batu Gajah, Kampar",
    state: "Perak",
    is_active: true,
  },
  {
    id: "PRK03",
    name: "Lenggong, Pengkalan Hulu, Grik",
    state: "Perak",
    is_active: true,
  },
  { id: "PRK04", name: "Temengor, Belum", state: "Perak", is_active: true },
  {
    id: "PRK05",
    name: "Kg Gajah, Teluk Intan, Bagan Datuk, Seri Iskandar, Beruas, Parit, Lumut, Sitiawan, Pulau Pangkor",
    state: "Perak",
    is_active: true,
  },
  {
    id: "PRK06",
    name: "Selama, Taiping, Bagan Serai, Parit Buntar",
    state: "Perak",
    is_active: true,
  },
  { id: "PRK07", name: "Bukit Larut", state: "Perak", is_active: true },
  {
    id: "SBH01",
    name: "Bahagian Sandakan (Timur), Bukit Garam, Semawang, Temanggong, Tambisan, Bandar Sandakan",
    state: "Sabah",
    is_active: true,
  },
  {
    id: "SBH02",
    name: "Beluran, Telupid, Pinangah, Terusan, Kuamut, Bahagian Sandakan (Barat)",
    state: "Sabah",
    is_active: true,
  },
  {
    id: "SBH03",
    name: "Lahad Datu, Silabukan, Kunak, Sahabat, Semporna, Tungku, Bahagian Tawau (Timur)",
    state: "Sabah",
    is_active: true,
  },
  {
    id: "SBH04",
    name: "Bandar Tawau, Balong, Merotai, Kalabakan, Bahagian Tawau (Barat)",
    state: "Sabah",
    is_active: true,
  },
  {
    id: "SBH05",
    name: "Kudat, Kota Marudu, Pitas, Pulau Banggi, Bahagian Kudat",
    state: "Sabah",
    is_active: true,
  },
  { id: "SBH06", name: "Gunung Kinabalu", state: "Sabah", is_active: true },
  {
    id: "SBH07",
    name: "Kota Kinabalu, Ranau, Kota Belud, Tuaran, Penampang, Papar, Putatan, Bahagian Pantai Barat",
    state: "Sabah",
    is_active: true,
  },
  {
    id: "SBH08",
    name: "Pensiangan, Keningau, Tambunan, Nabawan, Bahagian Pendalaman (Atas)",
    state: "Sabah",
    is_active: true,
  },
  {
    id: "SBH09",
    name: "Beaufort, Kuala Penyu, Sipitang, Tenom, Long Pa Sia, Membakut, Weston, Bahagian Pendalaman (Bawah)",
    state: "Sabah",
    is_active: true,
  },
  {
    id: "SGR01",
    name: "Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Rawang, S.Alam",
    state: "Selangor",
    is_active: true,
  },
  {
    id: "SGR02",
    name: "Kuala Selangor, Sabak Bernam",
    state: "Selangor",
    is_active: true,
  },
  {
    id: "SGR03",
    name: "Klang, Kuala Langat",
    state: "Selangor",
    is_active: true,
  },
  {
    id: "SWK01",
    name: "Limbang, Lawas, Sundar, Trusan",
    state: "Sarawak",
    is_active: true,
  },
  {
    id: "SWK02",
    name: "Miri, Niah, Bekenu, Sibuti, Marudi",
    state: "Sarawak",
    is_active: true,
  },
  {
    id: "SWK03",
    name: "Pandan, Belaga, Suai, Tatau, Sebauh, Bintulu",
    state: "Sarawak",
    is_active: true,
  },
  {
    id: "SWK04",
    name: "Sibu, Mukah, Dalat, Song, Igan, Oya, Balingian, Kanowit, Kapit",
    state: "Sarawak",
    is_active: true,
  },
  {
    id: "SWK05",
    name: "Sarikei, Matu, Julau, Rajang, Daro, Bintangor, Belawai",
    state: "Sarawak",
    is_active: true,
  },
  {
    id: "SWK06",
    name: "Lubok Antu, Sri Aman, Roban, Debak, Kabong, Lingga, Engkelili, Betong, Spaoh, Pusa, Saratok",
    state: "Sarawak",
    is_active: true,
  },
  {
    id: "SWK07",
    name: "Serian, Simunjan, Samarahan, Sebuyau, Meludam",
    state: "Sarawak",
    is_active: true,
  },
  {
    id: "SWK08",
    name: "Kuching, Bau, Lundu, Sematan",
    state: "Sarawak",
    is_active: true,
  },
  {
    id: "SWK09",
    name: "Zon Khas (Kampung Patarikan)",
    state: "Sarawak",
    is_active: true,
  },
  {
    id: "TRG01",
    name: "Kuala Terengganu, Marang, Kuala Nerus",
    state: "Terengganu",
    is_active: true,
  },
  { id: "TRG02", name: "Besut, Setiu", state: "Terengganu", is_active: true },
  {
    id: "TRG03",
    name: "Hulu Terengganu",
    state: "Terengganu",
    is_active: true,
  },
  {
    id: "TRG04",
    name: "Dungun, Kemaman",
    state: "Terengganu",
    is_active: true,
  },
  {
    id: "WLY01",
    name: "Kuala Lumpur, Putrajaya",
    state: "Wilayah Persekutuan",
    is_active: true,
  },
  {
    id: "WLY02",
    name: "Labuan",
    state: "Wilayah Persekutuan",
    is_active: true,
  },
] as const;

/**
 * A transformed version of JAKIM_ZONES for UI select/option elements.
 */
export const jakimZones = JAKIM_ZONES.map((zone) => ({
  value: zone.id,
  label: `${zone.id} - ${zone.name}`,
  state: zone.state,
}));

export type UiJakimZone = (typeof jakimZones)[number];

export const SUPPORTED_TIMEZONES: readonly string[] = [
  "Asia/Kuala_Lumpur",
  "Asia/Kuching", // For East Malaysia
] as const;

export const malaysianStates = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Pulau Pinang",
  "Perak",
  "Perlis",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "Wilayah Persekutuan",
] as const;

export const prayerTimeSources = [
  { value: "manual", label: "Manual Input" },
  { value: "jakim", label: "JAKIM e-Solat" },
  { value: "auto", label: "Automatic (Future)" },
];

export const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending_verification", label: "Pending Verification" },
];
