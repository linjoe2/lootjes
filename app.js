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
const sequelize = new Sequelize('lootjes', 'linjoe', '6007818', {
    host: 'localhost',
    dialect: 'postgres'
});
// users: username,password,list
const Users = sequelize.define('users', {
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    list: Sequelize.ARRAY(Sequelize.TEXT)
});

// groups: name, max
const Groups = sequelize.define('groups', {
	name: Sequelize.STRING,
	max: Sequelize.INTEGER

});

// every user can be only assigned to one user
Users.belongsTo(Users);

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
	console.log(req.body)
	Groups.findOne({where: {name: req.body.group}, raw: true}).then( (group => {
		if(!group) {
			// create new entry in database
			Groups.create({
				name: req.body.group,
				max: 14
			}).then( (newGroup) => {
				newGroup.createUser({
					username: req.body.username,
					password: req.body.password,
					list: []
				})
			})

		} else {
			// add group to user
			console.log(group)
			Users.create({
				username: req.body.username,
				password: req.body.password,
				list: [],
				groupId: group.id
			})
		}
	})
);
});

// test

//sequelize.sync({force: true})

//sequelize.sync().then(() => {

	
//Groups.findOne({where: {name: 'bssa'}, raw: true})
//.then((group) => {
//     console.log(group)
//     if(!group) {
//	Groups.create({ 
//		name: "bssa",
//		max: "14"
//	})
//	.then((newGroup) => { 
//		newGroup.createUser({
//			username: 'birds are chirpy',
//    			password: 'chirp chirp',
//			list: ['candy','chocolate']
//		})
//	})
//     } else {
//	Users.create({
//		username: 'birds are chirpy',
//		password: 'chirp chirp',
//		list: ['candy','chocolate'],	
//		groupId: group.id
//	})
//     }
//})

//});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
