CREATE TABLE tabung_types (
    id serial PRIMARY KEY,
    name VARCHAR(12)
);
CREATE TABLE tabung (
    id serial PRIMARY KEY,
    name VARCHAR(128),
    is_cents BOOLEAN,
    tabung_types_id INTEGER REFERENCES tabung_types(id)
);

CREATE TABLE kutipan (
    id serial PRIMARY KEY,
    tabung_id INTEGER REFERENCES tabung(id),
    total1c INTEGER,
    total5c INTEGER,
    total10c INTEGER,
    total20c INTEGER,
    total50c INTEGER,
    total1d INTEGER,
    total5d INTEGER,
    total10d INTEGER,
    total20d INTEGER,
    total50d INTEGER,
    total100d INTEGER
);
insert into tabung_types(name) values ('Harian');
insert into tabung_types(name) values ('Mingguan');
insert into tabung_types(name) values ('Biasa');
ALTER TABLE public.kutipan ADD create_date int8 NULL;
insert into tabung(name,is_cents,tabung_types_id) values ('Tabung Jumaat',false,2);