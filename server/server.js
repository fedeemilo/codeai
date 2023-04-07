import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()
const PORT = process.env.PORT

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

const nImagesObj = {
    ':one': 1,
    ':two': 2,
    ':three': 3,
    ':four': 4,
    ':five': 5,
    ':six': 6,
    ':seven': 7,
    ':eight': 8,
    ':nine': 9,
    ':ten': 10
}

const corsOpts = {
    origin: '*',

    methods: ['GET', 'POST'],

    allowedHeaders: ['Content-Type']
}

const app = express()
app.use(cors(corsOpts))
app.use(express.json())

app.get('/', async (req, res) => {
    console.log(process.env.OPENAI_API_KEY)
    res.status(200).send({
        message: 'Hello from Codeai'
    })
})

app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt.toLowerCase()
        const splittedPrompt = prompt.split(':')
        let response
        let nImages

        if (splittedPrompt.includes('img')) {
            if (nImagesObj[`:${splittedPrompt[1]}`]) {
                nImages = nImagesObj[`:${splittedPrompt[1]}`]
            }
            response = await openai.createImage({
                prompt: splittedPrompt[splittedPrompt.length - 1],
                n: nImages || 4,
                size: '256x256'
            })

            return res.status(200).send({
                bot: response.data.data
            })
        }

        response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `${prompt}`,
            temperature: 0,
            max_tokens: 2000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0
        })

        res.status(200).send({
            bot: response.data.choices[0].text
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({ error })
    }
})

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
