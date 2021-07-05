const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

app.use(morgan(function (tokens, req, res) {
    if (req.method === 'POST') {
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms',
            JSON.stringify(req.body)
        ].join(' ')
    } else {
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms',
        ].join(' ')
    }
}))

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "39-44-5323523"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "12-43-234345"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "39-23-6423122"
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "123444"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.filter(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    response.send(`
        <div>Phonebook has info for ${persons.length} people</div>
        <br>
        <div>${new Date()}</br>
    `)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const generateId = () => {
        let newId = Math.floor(Math.random() * 10000)
        while (persons.map(person => Number(person.id)).filter(id => id === newId).length > 0) {
            newId = Math.floor(Math.random() * 10000)
            console.log("randomised")
        }
        return newId
    }
    
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    if (persons.map(person => person.name).filter(name => name === body.name).length > 0) {
        return response.status(409).json({
            error: 'name must be unique'
        })
    }

    const newPerson = {
        id: generateId(),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(newPerson)

    response.json(newPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})