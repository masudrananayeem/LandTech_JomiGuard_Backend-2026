-- PostgreSQL/PostGIS-ready starting schema; not wired into demo API yet.
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE IF NOT EXISTS land_properties (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), district TEXT NOT NULL, upazila TEXT NOT NULL,
 mouza TEXT NOT NULL, dag_no TEXT NOT NULL, khatian_no TEXT NOT NULL,
 area_decimal NUMERIC(12,3), land_use TEXT, geom geometry(MultiPolygon, 4326),
 source_type TEXT NOT NULL DEFAULT 'synthetic', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS land_properties_geom_gix ON land_properties USING GIST (geom);
CREATE TABLE IF NOT EXISTS land_documents (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), property_id UUID REFERENCES land_properties(id),
 document_type TEXT NOT NULL, document_number TEXT, document_date DATE,
 extracted_fields JSONB NOT NULL DEFAULT '{}', extraction_confidence JSONB NOT NULL DEFAULT '{}',
 source_type TEXT NOT NULL DEFAULT 'synthetic', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ownership_claims (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), property_id UUID NOT NULL REFERENCES land_properties(id),
 owner_display_name TEXT NOT NULL, share_fraction NUMERIC(8,6), source_document_id UUID REFERENCES land_documents(id),
 valid_from DATE, valid_to DATE, verification_status TEXT NOT NULL DEFAULT 'unverified',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), CHECK (share_fraction IS NULL OR (share_fraction >= 0 AND share_fraction <= 1))
);
CREATE TABLE IF NOT EXISTS risk_assessments (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), property_id UUID REFERENCES land_properties(id),
 score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100), risk_level TEXT NOT NULL,
 findings JSONB NOT NULL DEFAULT '[]', disclaimer TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Production TODO: access control, audit log, retention policy, migrations, input validation and data provenance.
