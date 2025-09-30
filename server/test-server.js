import express from 'express'

const app = express()

app.use(express.json())

app.get('/', (req, res) => res.send('Test server working!'))

app.post('/api/user/register', (req, res) => {
    console.log("Register route hit!");
    console.log("Body:", req.body);
    res.json({message: "Registration successful!", data: req.body});
});

const PORT = 3001

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`)
})
