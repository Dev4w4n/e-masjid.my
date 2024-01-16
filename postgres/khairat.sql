CREATE TABLE tags (
    id serial PRIMARY KEY,
    name VARCHAR(12)
);

insert into tags(name) values ('P.RAWA');
insert into tags(name) values ('SG.R');
insert into tags(name) values ('TB');
insert into tags(name) values ('DW');


-- create a member table
CREATE TABLE person (
    id serial PRIMARY KEY,
    name VARCHAR(128),
    ic_number VARCHAR(12),
    address VARCHAR(256),
    phone VARCHAR(12)
);

CREATE TABLE members (
    id serial PRIMARY KEY,
    person_id INTEGER REFERENCES person(id),
    FOREIGN KEY (person_id) REFERENCES person(id)
);
CREATE TABLE member_tags (
    member_id INTEGER REFERENCES members(id),
    tags_id INTEGER REFERENCES tags(id)
);
CREATE TABLE dependents (
    member_id INTEGER REFERENCES members(id),
    person_id INTEGER REFERENCES person(id)
);

CREATE TABLE khairat_payment_history (
    id SERIAL PRIMARY KEY,
    member_id INTEGER,
    amount BIGINT,
    payment_date BIGINT,
    no_resit VARCHAR(12)
);


-----
ALTER TABLE public.person ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE public.person ALTER COLUMN ic_number SET NOT NULL;
