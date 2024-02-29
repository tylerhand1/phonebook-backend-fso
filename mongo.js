const mongoose = require('mongoose')

if (process.argv.length < 5) {
  if (process.argv.length != 3) {
    console.log('node mongo.js <password> <name> <number>')
    process.exit(1)
  }
}

const password = process.argv[2]

const url = `mongodb+srv://tyha7462:${password}@cluster0.u8mcoen.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Contact = mongoose.model('Contact', contactSchema)

if(process.argv.length > 3) {
  const name = process.argv[3]
  const number = process.argv[4]

  const contact = new Contact({
    name,
    number
  })
    
  contact.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  Contact.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(contact => {
      console.log(`${contact.name} ${contact.number}`)
    })
    mongoose.connection.close()
  })
}