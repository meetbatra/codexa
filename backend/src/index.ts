import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 8080
const allowedOrigin = process.env.NEXT_PUBLIC_API_URL

app.use(
  cors({
    origin: allowedOrigin,
  })
)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log('Codexa backend running on port 8080')
})
