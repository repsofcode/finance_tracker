require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => { res.send('api running') })

app.listen(process.env.PORT, () => { console.log('server running on port 5000') })
