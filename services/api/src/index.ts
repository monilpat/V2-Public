import express from "express"
import adminRouter from "./requests/admin"
import investRouter from "./requests/invest"
import tradeRouter from "./requests/trade"
import dotenv from "dotenv"
import { errorHandler } from "./middleware/error"
import poolsRouter from "./requests/pools"
import statsRouter from "./requests/stats"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(adminRouter)
app.use(investRouter)
app.use(tradeRouter)
app.use(poolsRouter)
app.use(statsRouter)
app.use(errorHandler)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running on http://localhost:${PORT} ...`)
  })
}

export default app
