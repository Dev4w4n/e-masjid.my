CREATE TABLE kariah_dependents(
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES person(id),
    hubungan_type_id INTEGER REFERENCES tetapan_types(id)
);

CREATE TABLE kariah_members(
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES person(id),
    bangsa_id INTEGER REFERENCES tetapan_types(id),
    pekerjaan_id INTEGER REFERENCES tetapan_types(id),
    warganegara_id INTEGER REFERENCES tetapan_types(id),
    status_perkahwinan_id INTEGER REFERENCES tetapan_types(id),
    is_khairat_kematian BOOLEAN DEFAULT(FALSE),
    is_oku BOOLEAN DEFAULT(FALSE),
    file_id_bil_utiliti INTEGER REFERENCES uploaded_files_cdn(id),
    file_id_gambar INTEGER REFERENCES uploaded_files_cdn(id)
);

CREATE TABLE kariah_members_assigned_types(
    id SERIAL PRIMARY KEY,
    kariah_member_id INTEGER REFERENCES kariah_members(id),
    tetapan_types_id INTEGER REFERENCES tetapan_types(id),
    tetapan_types_group_name VARCHAR(32)
);

-- Indexes for kariah_dependents
CREATE INDEX idx_kariah_dependents_person_id ON kariah_dependents(person_id);
CREATE INDEX idx_kariah_dependents_hubungan_type_id ON kariah_dependents(hubungan_type_id);

-- Indexes for kariah_members
CREATE INDEX idx_kariah_members_person_id ON kariah_members(person_id);
CREATE INDEX idx_kariah_members_bangsa_id ON kariah_members(bangsa_id);
CREATE INDEX idx_kariah_members_pekerjaan_id ON kariah_members(pekerjaan_id);
CREATE INDEX idx_kariah_members_warganegara_id ON kariah_members(warganegara_id);
CREATE INDEX idx_kariah_members_status_perkahwinan_id ON kariah_members(status_perkahwinan_id);
CREATE INDEX idx_kariah_members_file_id_bil_utiliti ON kariah_members(file_id_bil_utiliti);
CREATE INDEX idx_kariah_members_file_id_gambar ON kariah_members(file_id_gambar);

-- Indexes for kariah_members_assigned_types
CREATE INDEX idx_kariah_members_assigned_types_member_id ON kariah_members_assigned_types(kariah_member_id);
CREATE INDEX idx_kariah_members_assigned_types_tetapan_types_id ON kariah_members_assigned_types(tetapan_types_id);
CREATE INDEX idx_kariah_members_assigned_types_group_name ON kariah_members_assigned_types(tetapan_types_group_name);