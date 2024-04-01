CREATE TABLE tetapan (
    kunci VARCHAR(24) PRIMARY KEY,
    nilai VARCHAR(256)
);

INSERT INTO tetapan(kunci, nilai)
VALUES
    ('NAMA_MASJID', 'Masjid Demo'),
    ('NO_TEL_MASJID', '0123456789'),
    ('ALAMAT_MASJID', 'Jalan Masjid Demo, Desa Masjid');

CREATE TABLE tetapan_types (
    id serial PRIMARY KEY,
    group_name  VARCHAR(32),
    int_val INTEGER,
    str_val VARCHAR(128)
);

INSERT INTO tetapan_types (group_name, int_val, str_val)
VALUES
    ('HUBUNGAN_TYPE',1,'Anak'),
    ('HUBUNGAN_TYPE',2,'Ibu'),
    ('HUBUNGAN_TYPE',3,'Ayah'),
    ('HUBUNGAN_TYPE',4,'Nenek'),
    ('HUBUNGAN_TYPE',5,'Datuk'),
    ('HUBUNGAN_TYPE',6,'Isteri'),
    ('HUBUNGAN_TYPE',7,'Suami'),
    ('HUBUNGAN_TYPE',8,'Lain-lain');
/*
    ('PENYAKIT_TYPE',1,'AIDS'),
    ('PENYAKIT_TYPE',2,'GOUT'),
    ('PENYAKIT_TYPE',3,'HEPETITIS-A'),
    ('BANTUAN_TYPE',1,'ZAKAT'),
    ('BANTUAN_TYPE',2,'JKM'),
    ('BANTUAN_TYPE',3,'NGO'),
    ('NEGERI_TYPE',1,'PULAU PINANG'),
    ('NEGERI_TYPE',2,'PERAK');
*/
