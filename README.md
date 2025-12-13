![Github forks](https://badgen.net/github/forks/Dev4w4n/e-masjid.my?icon=github&label=forks)
![Github issues](https://img.shields.io/github/issues/Dev4w4n/e-masjid.my)
![Github last-commit](https://img.shields.io/github/last-commit/Dev4w4n/e-masjid.my)

<p align="center">
  <img src="https://i.postimg.cc/gcSyK8d6/logo.png" alt="Open E Masjid" width="80" height="80"/>
</p>

<h2 align="center"><b>Open E Masjid</b></h2>
<p align="center"><b>Sistem masjid berasaskan SaaS</b></p>

# Falsafah

Matlamat utama sistem ini adalah seperti berikut.

**Mudah digunakan**

- Tidak semua orang pakar IT. Reka bentuk sistem untuk bukan pakar IT memerlukan pertimbangan teliti.

**Gunakan kemahiran IT untuk kebaikan**

- Sumber terbuka adalah satu bentuk sedekah yang digalakkan dalam Islam.

**Kekal lama**

- Syarikat hosting/teknologi mungkin tidak kekal, tetapi dengan sumber terbuka, projek ini diharap dapat bertahan lebih lama demi ummah.

**Kita memberi, bukan mengambil**

- Kita sepatutnya menyumbang kepada komuniti Muslim, bukan mengambil manfaat daripada mereka, terutamanya Masjid.

## Prasyarat

Sebelum memulakan, pastikan perkara berikut telah tersedia:

- Supabase CLI
- Homebrew (untuk macOS)
- pnpm
- Node.js
- Akses ke terminal/shell
- Sambungan internet untuk klon repositori dan pemasangan kebergantungan

## � Persediaan Sistem Kali Pertama

> **📋 Ringkasan Pantas untuk Pengguna Baru**
>
> ```bash
> git clone https://github.com/Dev4w4n/e-masjid.my.git
> cd e-masjid.my
> pnpm install
> ./scripts/setup-supabase.sh   # Sediakan pangkalan data dan persekitaran
> pnpm run build:clean          # PENTING: Gunakan build:clean untuk kali pertama
> pnpm dev                      # Mulakan server pembangunan
> ```
>
> Aplikasi akan tersedia di: http://localhost:3000

### Pemasangan Prasyarat

Sebelum menjalankan aplikasi, pastikan anda telah memasang perkara berikut:

1. **Pasang Supabase CLI**:

   ```bash
   # Using npm
   npm install -g supabase

   # Using Homebrew (macOS)
   brew install supabase/tap/supabase

   # Verify installation
   supabase --version
   ```

2. **Mulakan perkhidmatan Supabase**:

   ```bash
   # Initialize and start Supabase
   supabase start
   ```

### Memahami Proses Binaan

Projek ini menggunakan TypeScript composite projects yang memerlukan urutan binaan yang betul:

- **Binaan Bersih** (selepas `pnpm clean` atau klon baru): Gunakan `pnpm run build:clean`
- **Binaan Biasa** (semasa pembangunan): Gunakan `pnpm build`

Pakej `shared-types` mesti dibina terlebih dahulu sebelum pakej lain boleh mengimport jenisnya.

## �🚀 Persediaan Pantas

### 1. Persediaan Repositori

```bash
# Klon repositori
git clone https://github.com/Dev4w4n/e-masjid.my.git e-masjid.my-agent-1
cd e-masjid.my-agent-1

# Pasang kebergantungan dengan pnpm
pnpm install

# PENTING: Bina semua pakej dengan urutan yang betul (untuk persediaan kali pertama)
pnpm run build:clean
```

⚠️ **Nota Penting**: Untuk persediaan kali pertama, sentiasa gunakan `pnpm run build:clean` selepas `pnpm install`. Ini memastikan TypeScript composite projects dibina dengan urutan kebergantungan yang betul.

### 2. Konfigurasi Persekitaran

```bash
# Konfigurasi pangkalan data dan persekitaran
./scripts/setup-supabase.sh
```

### 3. Mulakan Server Pembangunan

```bash
# Di root projek
# Mulakan semua aplikasi dengan Turborepo
pnpm dev

# Atau mulakan aplikasi tertentu
pnpm dev --filter=@masjid-suite/hub
```

**Catatan**: Jika anda menghadapi ralat semasa `pnpm dev`, pastikan langkah bina telah selesai dengan jayanya menggunakan `pnpm run build:clean` terlebih dahulu.

Aplikasi akan tersedia di:

- **Aplikasi Profil**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323

### 4. Konfigurasi Spec Kit (Pilihan)

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init --here
```

## 🧪 Ujian Aliran Kerja Lengkap

### Langkah 1: Persediaan Super Admin

1. **Pergi ke aplikasi**: http://localhost:3000
2. **Log masuk sebagai super admin**:
   - Emel: `super.admin@test.com`
   - Kata laluan: `TestPassword123!`
3. **Lengkapkan profil super admin**:
   - Nama penuh: "System Administrator"
   - Telefon: "+601234567890"
   - Alamat: Isikan alamat Malaysia yang sah
   - Masjid rumah: Biarkan kosong (akan cipta baru)

### Langkah 2: Cipta Masjid Pertama

1. **Akses Pengurusan Masjid** (hanya super admin)
2. **Cipta masjid baru**:
   ```json
   {
     "name": "Masjid Jamek Sungai Rambai",
     "registration_number": "MSJ-2024-001",
     "email": "admin@masjidjameksungairambai.org",
     "phone_number": "+60412345678",
     "description": "Community mosque in Bukit Mertajam, Pulau Pinang",
     "address": {
       "address_line_1": "Jalan Masjid Jamek",
       "address_line_2": "Sungai Rambai",
       "city": "Bukit Mertajam",
       "state": "Pulau Pinang",
       "postcode": "14000"
     }
   }
   ```

### Langkah 3: Daftar Pengguna Baru

1. **Buka tetingkap pelayar baru/incognito** (untuk simulasi pengguna lain)
2. **Pergi ke pendaftaran**: http://localhost:3000/auth/register
3. **Daftar pengguna baru**:
   - Emel: `ali@example.com`
   - Kata laluan: `UserPassword123!`
4. **Lengkapkan profil**:
   - Nama penuh: "Ali bin Abdullah"
   - Telefon: "+60123456789"
   - Alamat: Alamat Malaysia yang sah
   - Masjid rumah: Pilih "Masjid Jamek Sungai Rambai"

### Langkah 4: Mohon Peranan Admin

1. **Sebagai pengguna berdaftar**, pergi ke "Permohonan Admin"
2. **Hantar permohonan**:
   - Pilih masjid: "Masjid Jamek Sungai Rambai"
   - Mesej: "Saya ingin membantu mengurus masjid ini"
3. **Status permohonan**: Akan dipaparkan "Menunggu"

### Langkah 5: Luluskan Permohonan Admin

1. **Tukar semula ke tetingkap super admin**
2. **Pergi ke "Permohonan Admin"**
3. **Semak permohonan Ahmad**:
   - Status: Lulus
   - Nota: "Diluluskan untuk penglibatan komuniti"
4. **Sahkan kelulusan**

### Langkah 6: Uji Akses Admin

1. **Sebagai Ahmad**, segarkan halaman
2. **Peranan kini**: "Admin Masjid"
3. **Akses ciri admin**:
   - Lihat senarai ahli masjid
   - Lihat profil pengguna yang menunggu kelulusan
   - Kemaskini maklumat masjid

### Langkah 7: Uji Akses Pengguna Awam

1. **Buka tetingkap pelayar lain**
2. **Layari tanpa pendaftaran**:
   - Lihat senarai masjid awam
   - Lihat butiran masjid
   - Cuba tindakan terhad → akan diarahkan ke pendaftaran

## 🧪 Ujian Automatik

### Ujian Unit

```bash
# Jalankan semua ujian unit
pnpm test

# Jalankan ujian dengan liputan
pnpm test:coverage

# Jalankan ujian dalam mod pantau
pnpm test:watch
```

### Ujian Integrasi

```bash
# Jalankan ujian integrasi API
pnpm test:integration

# Uji operasi pangkalan data
pnpm test:db
```

### Ujian Hujung ke Hujung

```bash
# Jalankan ujian E2E dengan Playwright
pnpm test:e2e

# Jalankan ujian E2E dalam mod UI
pnpm test:e2e:ui

# Uji aliran pengguna tertentu
pnpm test:e2e --grep "admin workflow"
```

## 📱 Ujian Antara Muka Pengguna

### Aliran Lengkap Profil

1. **Keadaan profil tidak lengkap**:
   - Pengguna melihat arahan melengkapkan profil
   - Tidak boleh akses ciri khusus peranan
   - Penunjuk kemajuan menunjukkan medan yang belum lengkap

2. **Pengesahan borang**:
   - Format nombor telefon Malaysia
   - Poskod yang sah
   - Penunjuk medan wajib

3. **Maklum balas kejayaan**:
   - Pengesahan profil lengkap
   - Notifikasi ciri dibuka
   - Perubahan UI mengikut peranan

### Kawalan Akses Berdasarkan Peranan

Uji pengalaman pengguna berbeza:

| Peranan      | Boleh Akses                                    | Tidak Boleh Akses                 |
| ------------ | ---------------------------------------------- | --------------------------------- |
| Awam         | Senarai masjid, butiran                        | Pengurusan pengguna, cipta profil |
| Berdaftar    | Pengurusan profil, permohonan admin            | Pengurusan pengguna, cipta masjid |
| Admin Masjid | Pengurusan masjid yang ditugaskan, profil ahli | Masjid lain, peranan pengguna     |
| Super Admin  | Semua ciri                                     | N/A                               |

## 🛠️ Arahan Pembangunan

### Kualiti Kod

```bash
# Lint semua pakej
pnpm lint

# Baiki isu lint
pnpm lint:fix

# Semak jenis
pnpm type-check

# Format kod
pnpm format
```

### Bina & Deploy

```bash
# Bina semua aplikasi (pembangunan normal)
pnpm build

# Bina selepas operasi bersih (gunakan ini selepas pnpm clean)
pnpm run build:clean
# atau
./scripts/build-packages.sh

# Bina aplikasi tertentu
pnpm build --filter=@masjid-suite/hub

# Pratonton binaan produksi
pnpm preview
```

#### ⚠️ Nota Penting: Bina Selepas Operasi Bersih

Selepas menjalankan `pnpm clean && pnpm install`, **jangan** terus gunakan `pnpm build`. Gunakan `pnpm run build:clean` untuk memastikan pakej dibina dengan urutan yang betul:

```bash
# ❌ Jangan lakukan ini selepas pnpm clean
pnpm clean && pnpm install && pnpm build

# ✅ Lakukan ini pula
pnpm clean && pnpm install && pnpm run build:clean
```

**Sebab**: TypeScript composite projects memerlukan fail deklarasi (.d.ts) dijana dalam urutan kebergantungan yang betul. Pakej `shared-types` mesti dibina dahulu sebelum pakej lain boleh mengimport jenisnya.

### Pengurusan Pangkalan Data

```bash
# Cipta migrasi baru
supabase migration new add_new_feature

# Laksanakan migrasi
supabase db push

# Tetapkan semula pangkalan data
supabase db reset

# Jana jenis TypeScript
supabase gen types typescript --local > packages/shared-types/src/database.ts
```

## 🔧 Penyelesaian Masalah

### Isu Lazim

**Ralat Sambungan Supabase**

```bash
# Semak status Supabase
supabase status

# Mulakan semula Supabase
supabase stop
supabase start
```

**Ralat Binaan**

```bash
# Bersihkan cache binaan
pnpm clean

# Pasang semula kebergantungan dan bina dengan urutan yang betul
rm -rf node_modules
pnpm install
pnpm run build:clean  # PENTING: Gunakan build:clean selepas operasi bersih
```

**Ralat TypeScript "Cannot find module '@masjid-suite/shared-types'"**

Ralat ini berlaku apabila:

- Selepas menjalankan `pnpm clean && pnpm install`
- Kloning repositori untuk kali pertama
- Fail deklarasi (.d.ts) belum dijana dengan urutan yang betul

**Penyelesaian**:

```bash
# Bina pakej dalam urutan kebergantungan
./scripts/build-packages.sh
# atau
pnpm run build:clean
```

**Mengapa ini berlaku?**: TypeScript composite projects memerlukan pakej `shared-types` dibina dahulu sebelum pakej lain boleh menggunakan jenisnya. Skrip `build:clean` memastikan urutan binaan yang betul.

**Ralat Jenis**

```bash
# Jana semula jenis pangkalan data
supabase gen types typescript --local > packages/shared-types/src/database.ts

# Mulakan semula pelayan TypeScript dalam VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Pembolehubah Persekitaran

Pastikan semua pembolehubah persekitaran yang diperlukan telah ditetapkan:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`

### Konflik Port

Port lalai yang digunakan:

- Aplikasi Profil: 3000
- Supabase API: 54321
- Supabase Studio: 54323
- Supabase Auth: 9999

## 📚 Ujian API

### Menggunakan curl

**Daftar pengguna**:

```bash
curl -X POST http://localhost:54321/auth/v1/signup \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

**Cipta profil**:

```bash
curl -X POST http://localhost:54321/rest/v1/profiles \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "full_name": "Test User",
    "phone_number": "+60123456789",
    "address": {
      "address_line_1": "123 Test Street",
      "city": "Kuala Lumpur",
      "state": "Kuala Lumpur",
      "postcode": "50100"
    }
  }'
```

### Menggunakan Postman/Insomnia

Import spesifikasi OpenAPI dari `contracts/api-spec.yaml` untuk dokumentasi API penuh dan keupayaan ujian.

## 🎯 Pengesahan Kriteria Kejayaan

### Senarai Semak Keperluan Fungsian

- [ ] Super admin boleh log masuk dengan kelayakan persekitaran
- [ ] Super admin boleh cipta masjid
- [ ] Pengguna boleh daftar dan lengkapkan profil
- [ ] Pengesahan profil berfungsi untuk format Malaysia
- [ ] Pengguna boleh mohon peranan admin
- [ ] Super admin boleh lulus/tolak permohonan
- [ ] Admin masjid boleh urus masjid mereka
- [ ] Kawalan akses berdasarkan peranan berfungsi dengan betul
- [ ] Pengguna awam mempunyai tahap akses yang sesuai

### Pengesahan Prestasi

- [ ] Muat halaman awal < 2 saat
- [ ] Navigasi antara halaman < 500ms
- [ ] Penyerahan borang < 1 saat
- [ ] Pertanyaan pangkalan data dioptimumkan dengan indeks yang betul

### Pengesahan Keselamatan

- [ ] Token JWT disahkan dengan betul
- [ ] Polisi Keselamatan Tahap Baris berfungsi
- [ ] Pengesahan dan pembersihan input
- [ ] Pengendalian ralat yang betul tanpa kebocoran data

## 📈 Langkah Seterusnya

Selepas melengkapkan panduan pantas ini:

1. **Terokai struktur kod**
2. **Baca dokumentasi seni bina**
3. **Sediakan persekitaran pembangunan anda**
4. **Mula menyumbang ciri baharu**

Untuk menambah aplikasi baharu ke monorepo, lihat [Panduan Sumbangan](../CONTRIBUTING.md) dan [Dokumentasi Sistem Specify](../.specify/README.md).

---

**Perlukan Bantuan?**

- Semak [Panduan Penyelesaian Masalah](../docs/troubleshooting.md)
- Semak [Dokumentasi API](./contracts/api-spec.yaml)
- Rujuk [Garis Panduan Pembangunan](../docs/development.md)

## Panduan untuk menyumbang

_Fork_ repo ini dan hantar _Pull Request_ anda.

Kami mahu input anda! Kami ingin menjadikan penyumbangan kepada projek mudah dan telus, sama ada dengan:

- Melaporkan pepijat
- Menghantar pembetulan
- Mencadangkan ciri baru
- Menambah baik ciri
- Dokumentasi
- Ujian unit

Atau anda ingin berbual dengan kami, cari kami di [Discord](https://discord.gg/k2zGpWTDpe).

[![Contributors](https://contrib.rocks/image?repo=Dev4w4n/e-masjid.my)](https://github.com/Dev4w4n/e-masjid.my/graphs/contributors)
