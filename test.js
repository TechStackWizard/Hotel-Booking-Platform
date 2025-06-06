const express = require('express')
const app = express();
const session = require('express-session')

const sessionOptions = {
    secret: 'abc123kumar',
    resave : false,
    saveUninitialized: true
}

app.use(session(sessionOptions))


// app.use((req, res, next) => {
//     res.locals.name = 'Anshul';
//     res.locals.age = 20;
//     // console.log(res.locals);
//     res.send({...res.locals, msg : "Data saved..."});
//     next()
// })

app.get('/', (req, res)=>{
   res.send('root')
})

app.listen(3000)