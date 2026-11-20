import pg from 'pg'
const {Pool} = pg

const pool = new Pool(
    {
        host: process.env.Hostname,
        user: process.env.UsernameDB,
        password: process.env.PasswordDB,
        port: Number(process.env.PortDB),
        database: process.env.DatabaseDB,

    }
)

export default pool