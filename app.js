const debug = require('debug')('app:start');
//const dbDebug = require('debug')('app:db');
const express = require('express');
const config = require('config');
const morgan = require('morgan');
const Joi = require('joi');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Enviroment config
console.log('Aplication: ' + config.get('name'));
console.log('DB Server: ' + config.get('dbConfig.host'));

// Morgan for development enviroment
if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    //console.log('Morgan Enable');
    debug('Morgan Enable');    
}

debug('Connecting db...');

const users = [
    { id: 1, name: 'Edgar' },
    { id: 2, name: 'Yase' },
    { id: 3, name: 'Maty' }
];

app.get('/', (req, res) => {
    res.send('Hello world from Express.');
});

app.get('/api/users', (req, res) => {
    res.send(users);
});

app.get('/api/users/:id', (req, res) => {
    //let user = users.find(u => u.id === parseInt(req.params.id));
    let user = existUser(req.params.id);
    if (!user) res.status(404).send(`User not found`);
    res.send(user);
});

app.post('/api/users', (req, res) => {

    const schema = Joi.object({
        name: Joi.string().alphanum().min(3).max(30).required()
    });

    //const {error, value} = schema.validate({ name: req.body.name });
    const { error, value } = validateUser(req.body.name);

    if (!error) {
        const user = {
            id: users.length + 1,
            name: value.name
        };
        users.push(user);
        res.send(user);
    } else {
        const messageE = error.details[0].message;
        res.status(400).send(messageE);
    }
});

app.put('/api/users/:id', (req, res) => {
    let user = existUser(req.params.id);
    if (!user) {
        res.status(404).send(`User not found`);
        return;
    }

    const { error, value } = validateUser(req.body.name);

    if (error) {
        const messageE = error.details[0].message;
        res.status(400).send(messageE);
        return;
    }

    user.name = value.name;
    res.send(user);
});

app.delete('/api/users/:id', (req, res) => {
    let user = existUser(req.params.id);
    if (!user) {
        res.status(404).send(`User not found`);
        return;
    }

    const index = users.indexOf(user);
    users.splice(index, 1);

    res.send(user);
});

const port = process.env.PORT || 3000;

app.listen(3000, () => {
    console.log(`Listening from port ${port}...`);
});

function existUser(id) {
    return (users.find(u => u.id === parseInt(id)));
}

function validateUser(nam) {
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    return (schema.validate({ name: nam }));
}