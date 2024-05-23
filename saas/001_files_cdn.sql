CREATE TABLE uploaded_files_cdn(
    id SERIAL PRIMARY KEY,
    cdn_id INTEGER NOT NULL,
    path VARCHAR(255) NOT NULL,
    create_date BIGINT,
    table_reference VARCHAR(255),
    mark_as_delete BOOLEAN DEFAULT(FALSE)
);
