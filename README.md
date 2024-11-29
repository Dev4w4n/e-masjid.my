[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.en.md)
![Github forks](https://badgen.net/github/forks/Dev4w4n/e-masjid.my?icon=github&label=forks)
![Github issues](https://img.shields.io/github/issues/Dev4w4n/e-masjid.my)
![Github last-commit](https://img.shields.io/github/last-commit/Dev4w4n/e-masjid.my)

<p align="center">
  <img src="./public-web/src/assets/home/logo.png" alt="E-Masjid.My" width="80" height="80"/>
</p>

<h2 align="center"><b>E-Masjid.My</b></h2>
<p align="center"><b>Sistem masjid untuk semua</b></p>
<p align="center">
  E-Masjid.My ialah sebuah sistem pengurusan masjid percuma dan sumber terbuka (lesen MIT)
</p><br>
<h2 align="center">
  <a href='https://demo.e-masjid.my'>Demo Langsung</a>
</h2><br>

# Falsafah

Matlamat-matlamat utama sistem ini ialah seperti berikut.

**Mudah untuk digunakan**

- Bukan semua orang pakar IT. Mereka bentuk sebuah sistem untuk orang bukan IT memerlukan pertimbangan yang teliti.

**Masa untuk menggunakan kemahiran IT untuk berbuat kebaikan**

- Sumber terbuka ialah suatu bentuk sedekah — sesuatu yang dituntut dalam Islam.

**Jangka hayat yang panjang**

- Syarikat pengehosan/teknologi mungkin mati tetapi kami berharap dengan menyerahkan projek ini secara sumber terbuka, projek ini dapat hidup lebih lama demi ummah.

**Beri, bukan ambil**

- Kita sepatutnya menyumbang kepada komuniti Muslim, terutamanya masjid dan bukan mengambil manfaat daripada mereka.

## Prasyarat

1. GIT https://www.git-scm.com/downloads
2. Docker Desktop https://docs.docker.com/get-docker/
3. Node 20 https://nodejs.org/en/download
4. Go https://go.dev/dl/
5. VSCode https://code.visualstudio.com/download

## Keperluan Minimum Sistem untuk tujuan Pembangunan Sistem

1. Pemproses: 1.6 GHz atau lebih pantas
2. Memori: 8 GB RAM atau lebih tinggi

## Panduan permulaan pantas (Docker compose)

### Fork repo ini

1. _Fork_ repo ini ke akaun Github anda, contoh `https://github.com/<github-user>/e-masjid.my`, dengan menekan butang _Fork_ di bahagian atas sebelah kanan laman web ini.
2. Setelah selesai _Fork_, _klon_ repo ini ke komputer anda.

```
git clone https://github.com/<github-user>/e-masjid.my.git
```

3. Setelah selesai _klon_, navigasi ke _folder_ e-masjid.my.

```
cd e-masjid.my
```

4. Ikut arahan seterusnya seperti di bawah bergantung kepada sistem pengoperasian komputer anda.

```
docker compose up -d
```

Skrip ini akan membina semua API secara automatik dan melaksanakan arahan docker-compose yang akan menghidupkan 6 _container_ untuk persekitaran pembangunan.

Apabila kesemua _container_ telah hidup, anda boleh menghentikan mana-mana _container_ yang tidak diperlukan dalam tugasan anda.

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
