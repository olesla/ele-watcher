import dotenv from 'dotenv'
import mysql from 'mysql2'

dotenv.config()

const con = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
})

con.connect(err => {
	if (err) throw err

	con.query(
		'CREATE TABLE entries (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, url VARCHAR(255), xpath VARCHAR(255), content VARCHAR(255))',
		(err, _) => {
			if (err && err.errno !== 1050) throw err
			con.destroy()
			return
	})
})
