import pg from 'pg'

// Configure pg module to accept self-signed certificates globally
// This must be called before any database connections are created
pg.defaults.ssl = {
  rejectUnauthorized: false,
}

export { pg }
