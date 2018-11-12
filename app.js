const Sequelize = require('sequelize');
const express = require('express')
const app = express()


// -------- express settings -------- //
const port = 3000
app.set('view engine', 'ejs')

// bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// -------- Sequelize settings -------- //
const sequelize = new Sequelize('linjoe', 'linjoe', '6007818', {
    host: 'localhost',
    dialect: 'postgres'
});

const Users = sequelize.define('users', {
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    list: Sequelize.ARRAY(Sequelize.TEXT)
});

const Groups = sequelize.define('groups', {
	groupname: Sequelize.STRING,
	max: Sequelize.INTEGER
});

// every user can be only assigned to one user
Users.belongsTo(Users)

// every user gets a group assigned
Groups.hasMany(Users)
Users.belongsTo(Groups)

// makes it recreate the tables every restart
sequelize.sync({force: true});


// ---------- pages ---------- //


// home page
// shows: nice landing page where you can register

app.get('/', (req, res) => {
 res.render('index',{})      
})


// register page
// shows: register form: username,password,list and group

app.get('/register', (req, res) => {
 res.render('register',{})      
})

// log in page
// shows: user login and logout field 
app.get('/login', (req, res) => {
 res.render('login',{})      
})

// user page
// shows: your username, users in group, the user you got assigned too

app.get('/list', (req, res) => {
 res.render('list',{})      
})

// ------------ posts --------- //

app.post('/register', (req,res) => {

});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
