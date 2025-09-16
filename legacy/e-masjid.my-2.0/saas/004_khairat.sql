-- CREATE TABLE tags (
--     id serial PRIMARY KEY,
--     name VARCHAR(12)
-- );

insert into khairat_tags(name) values ('P.RAWA');
insert into khairat_tags(name) values ('SG.R');
insert into khairat_tags(name) values ('TB');
insert into khairat_tags(name) values ('DW');


-- create a member table
-- CREATE TABLE person (
--     id serial PRIMARY KEY,
--     name VARCHAR(128),
--     ic_number VARCHAR(12),
--     address VARCHAR(256),
--     phone VARCHAR(12)
-- );

-- CREATE TABLE members (
--     id serial PRIMARY KEY,
--     person_id INTEGER REFERENCES person(id),
--     FOREIGN KEY (person_id) REFERENCES person(id)
-- );
-- CREATE TABLE members_tags (
--     id serial PRIMARY KEY,
--     member_id INTEGER REFERENCES members(id),
--     tags_id INTEGER REFERENCES tags(id)
-- );
-- CREATE TABLE dependents (
--     id serial PRIMARY KEY,
--     member_id INTEGER REFERENCES members(id),
--     person_id INTEGER REFERENCES person(id),
--     hubungan_id int4 NULL
-- );

-- CREATE TABLE khairat_payment_history (
--     id SERIAL PRIMARY KEY,
--     member_id INTEGER,
--     amount BIGINT,
--     payment_date BIGINT,
--     no_resit VARCHAR(12)
-- );


-----
ALTER TABLE public.person ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE public.person ALTER COLUMN ic_number SET NOT NULL;

--- changes in v1.10-beta.11 (current release)
ALTER TABLE public.person 
    ADD COLUMN jantina_types_id INTEGER REFERENCES tetapan_types(id),
    ADD COLUMN birth_date BIGINT,
    ADD COLUMN email_address VARCHAR(320);

--- changes in v1.13-beta.1 (current release)
-- ALTER TABLE  members RENAME TO khairat_members;
-- ALTER TABLE  members_tags RENAME TO khairat_members_tags;
-- ALTER TABLE  tags RENAME TO khairat_tags;
-- ALTER TABLE  dependents RENAME TO khairat_dependents;
