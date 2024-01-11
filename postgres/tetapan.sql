CREATE TABLE tetapan (
    kunci VARCHAR(24) PRIMARY KEY,
    nilai VARCHAR(256)
);

INSERT INTO tetapan(kunci, nilai)
VALUES
    ('NAMA_MASJID', 'Masjid Demo'),
    ('NO_TEL_MASJID', '0123456789'),
    ('ALAMAT_MASJID', 'Jalan Masjid Demo, Desa Masjid');