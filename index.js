require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.static('dist'))
app.use(express.json())

const cors = require('cors')
const Contact = require('./model/contact')
app.use(cors())

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

morgan.token('body', req => {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))

app.get('/api/persons', (req, res) => {
    Contact.find({}).then(contacts => {
        res.json(contacts)
    })
})

app.get('/api/persons/:id', (req, res) => {
    Contact.findById(req.params.id)
        .then(contact => {
            if (contact) {
                res.json(contact)
            } else {
                res.status(404).end()
            }
        })
})

app.get('/info', (req, res) => {
    Contact.find({})
        .then(result => {
            res.send(`
            Phonebook has info for ${result.length} people
            <br>
            ${new Date().toString()}
            `)
        })
})

app.post('/api/persons', (req, res) => {
    const body = req.body
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'content missing'
        })
    }
    
    const contact = new Contact({
        name: body.name,
        number: body.number,
    })

    contact.save().then(savedContact => {
        res.json(savedContact)
    })
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
    if(!body.name || !body.number) {
        return res.status(400).json({
            error: 'content missing'
        })
    }
    const contact = {
        name: body.name,
        number: body.number,
    }

    Contact.findByIdAndUpdate(req.params.id, contact, {new: true})
        .then(updatedContact => {
            if (updatedContact) {
                res.json(updatedContact)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Contact.findByIdAndDelete(req.params.id)
        .then(result => {
            if (result) {
                res.status(204).end()
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (err, req, res, next) => {
    console.log(err.message)

    if (err.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    }

    next(err)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})