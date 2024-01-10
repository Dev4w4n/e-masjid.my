[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.en.md)

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

Falsafah
=====
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
1. Docker
2. Java 17 (Spring Boot 3.2.0)
3. Maven
4. Node 20 (ReactJS 18 + CoreUI + Tailwind CSS)
5. VSCode (Disyorkan)

## Panduan permulaan pantas (Docker compose)
### Klon repo ini
```
git clone https://github.com/Dev4w4n/e-masjid.my.git;
cd e-masjid.my
```
### run-dev.sh (bagi Linux)
```
sh run-dev.sh
```
### run-dev.sh (bagi Windows) - Gunakan terminal Git Bash di VSCode
```
sh run-dev.sh
```

Skrip ini akan membina semua API secara automatik dan melaksanakan arahan docker-compose yang akan menghidupkan 6 *container* untuk persekitaran pembangunan.

Apabila kesemua *container* telah hidup, anda boleh menghentikan mana-mana *container* yang tidak diperlukan dalam tugasan anda.

## Gradle Build

Anda juga boleh menggunakan ./gradlew (atau gradlew.bat untuk windows) yg disediakan to memperinci/melaksanakan build. Perintah-perintah di bawah ini akan menunjukkan gradle tasks yang tersedia:

```sh
./gradlew task

./gradlew task --all
```

### Gradle build utk setiap modul backend

Sepertimana yang anda dapat lihat pada output `./gradlew task --all`, anda boleh melaksanakan build secara berasingan untuk setiap modul backend. Setiap modul backend ditulis dalam Spring boot, jadi anda boleh menggunakan plugin org.springframework.boot seperti berikut:

```sh
./gradlew api:tabung-api:bootRun  --args='--spring.profiles.active=local'
```

Anda juga boleh menjana fail Jar secara berasingan untuk digunakan pada docker-compose. Cara untuk menjana Jar adalah seperti berikut:

```sh
./gradlew api:tabung-api:bootJar
```

### Tugasan gradle: ultimateBuild

Untuk binaan keseluruhan projek, kami menyediakan `ultimateBuild`. `ultimateBuild` boleh dijalankan dengan:

```sh
./gradlew ultimateBuild
```

`ultimateBuild` dikodkan seperti berikut:

```groovy
task ultimateBuild( type: Task,
        dependsOn: ["api:buildapi","dashboard:publish","public-web:publish"]
        ) {
    description="Build all programs"
    
    doLast {
        println  "build completed"
    }
}
```

Di mana: 
  - `api:buildapi` membina kesemua projek api, termasuk menyusun dan menyediakan pakej yg terbina.
  - `dashboard:publish` menyusun projek dashboard dan menyediakan fail2 untuk disiarkan oleh pelayan.
  - `public-web:publish` menyusun projek public-web dan menyediakan fail2 untuk disiarkan oleh pelayan.

## Panduan untuk menyumbang
*Fork* repo ini dan hantar *Pull Request* anda.

Kami mahu input anda! Kami ingin menjadikan penyumbangan kepada projek mudah dan telus, sama ada dengan:

- Melaporkan pepijat
- Menghantar pembetulan
- Mencadangkan ciri baru
- Menambah baik ciri
- Dokumentasi
- Ujian unit
  
Atau anda ingin berbual dengan kami, cari kami di [Discord](https://discord.gg/k2zGpWTDpe).

