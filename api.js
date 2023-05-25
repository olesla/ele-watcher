import bodyParser from 'body-parser'
import express from 'express'
import dotenv from 'dotenv'
import mysql from 'mysql2'
import watch from './watcher.js'

const app = express()
app.use(bodyParser.json())

dotenv.config()
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
})

const dbQuery = sql => new Promise((resolve, reject) => {
	pool.getConnection((err, con) => {
		if (err) throw err

		try {
			con.query(sql, (err, results, _) => {
				con.release()
				if (err) {
					console.error(err)
					reject(err)
				}
				resolve(results)
			})
		} catch (err) {
			console.error(err)
			reject(err)
		}
	})
})

app.get('/entries', async (_, res) => {
	try {
		const entries = await dbQuery("select * from entries")
		return res.status(200).json({entries})
	} catch (err) {
		console.error(err, err.stack)
		return res.status(500).send()
	}
})

app.post('/entries', async (req, res) => {
	if (!req.body.url || !req.body.xpath || !req.body.content)
		return res.status(400).json({error: 'url, xpath and content required'})

	try {
		pool.getConnection((err, con) => {
			if (err) throw err

			con.query(
				'insert into entries (url, xpath, content) values (?, ?, ?)',
				[req.body.url, req.body.xpath, req.body.content],
				(err, _, __) => {
					con.release()
					if (err) throw err
			})
		})
		return res.status(201).send()
	} catch (err) {
		console.error(err, err.stack)
		return res.status(500).send()
	}
})

app.patch('/entries/:id', async (req, res) => {
	try {
		pool.getConnection((err, con) => {
			if (err) throw err
			con.query(
				'update entries set url=?, xpath=?, content=? where id=?',
				[req.body.url, req.body.xpath, req.body.content, req.params.id],
				(err, _, __) => {
					con.release()
					if (err) throw err
			})
		})
		return res.status(200).send()
	} catch (err) {
		console.error(err, err.stack)
		return res.status(500).send()
	}
})

app.delete('/entries/:id', async (req, res) => {
	try {
		pool.getConnection((err, con) => {
			if (err) throw err
			con.query(
				'delete from entries where id=?',
				[req.params.id],
				(err, _, __) => {
					con.release()
					if (err) throw err
			})
		})
		return res.status(200).send()
	} catch (err) {
		console.error(err, err.stack)
		return res.status(500).send()
	}
})

app.listen(3020, () => {
	console.info(`API listening on port 3020`)
})

watch()
