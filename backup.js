require("dotenv").config();
const express = require('express');
const OpenAI = require("openai");
const cors = require("cors");
const multer = require('multer');
const fs = require("fs");
const app = express();

const PORT = process.env.PORT || 3000;
const openai = new OpenAI(
    { apiKey: process.env.CHATGPT_API_KEY }
);

function convertToBase64(file) {
    let fileData = fs.readFileSync(file);
    return new Buffer.from(fileData).toString('base64')
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

app.use(cors());
// app.use(express.json()); // tells express we are going to receive data in json format from req.body f
app.use(express.urlencoded({ extended: true }));

app.post('/api/analyze-image', upload.single('file'), (req, res) => {
    if (req.file) {
        await main(req.file.originalname)
        res.json(req.file);
    }
    else {
        res.send("no file")
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
})

async function main(filePath) {
    const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        max_tokens: 500,
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: "generate the table for given image and give the output in format such each row is in form of list of strings separated by comma and just replace ✓/X with yes/no. capture all the potential data from the table. Do not generate any extra notes just give output in list format nothing else" },
                    {
                        type: "image_url",
                        image_url: `data:image/jpeg;base64, ${convertToBase64('image10.jpg')}`
                    },
                ],
            },
        ],
    });
    console.log(response.choices[0].message.content.toString());
}

/*
image_url: {
    "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
},

        public static Dictionary<string, List<string>> SpecsAliasDict = new()
        {
            {"COMFORT AND CONVENIENCE", new (){"Sigma", "Delta", "Zeta", "Alpha"}},
            {"Intelligent Key(Push Start/Stop)", new (){"No", "Yes", "Yes", "Yes"}},
        }
        primary promt:
        generate the table for given image and give the output in tabular format with rows and columns and replace ✓/X with yes/no. Give the output in proper table format I want all the rows and columns aligned

        secondary prompt to create the key value pair
        generate the table for given image and give the output key value format where first column will be the key and remaining columns will be the values of the key in list format just replace ✓/X with yes/no"
*/

