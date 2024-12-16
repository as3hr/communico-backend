CREATE DATABASE postgres_db;

\c postgres_db;

CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER;

GRANT ALL PRIVILEGES ON DATABASE postgres_db TO postgres;