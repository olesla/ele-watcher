import dotenv from 'dotenv'
import puppeteer from 'puppeteer'
import axios from 'axios'

dotenv.config()
const API = `http://localhost:3020`

const postDiscord = async msg => {
	await axios.post(process.env.DISCORD_URL, {
		username: process.env.DISCORD_USERNAME,
		content: msg,
	})
}

const checkEntries = async () => {
	const response = await axios.get(`${API}/entries`)
	const entries = response.data.entries
	const browser = await puppeteer.connect({ browserWSEndpoint: 'ws://browserless:3000' })

	for (const entry of entries) {
		const page = await browser.newPage()
		await page.goto(entry.url)
		const content = await page.evaluate(xpath => document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerHTML, entry.xpath)
		if (content != entry.content) {
			await postDiscord(`[${entry.url}] was changed from _"${entry.content}"_ to _"${content}"_`)
			await axios.delete(`${API}/entries/${entry.id}`)
		}
	}

	await browser.close()
}

export default async function watch() {
	try {
		await checkEntries()
	} catch (err) {
		console.error(err, err.stack)
	} finally {
		await new Promise(resolve => setTimeout(() => resolve(), 1000 * 60 * process.env.WAIT_MINUTES))
		watch()
	}
}
