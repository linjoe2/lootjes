const Sequelize = require('sequelize');
const express = require('express')
const app = express()


// -------- sessions settings -------- //
const session = require('express-session');

app.use(session({
	secret: 'oh wow very secret much security',
	resave: true,
	saveUninitialized: false
}));

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

sequelize.sync({force: false});


// ---------- pages ---------- //


// home page
// shows: nice landing page where you can register

app.get('/', (req, res) => {
 	res.render('index', {
		message: req.query.message,
		user: req.session.user
	});
     
})


// register page
// shows: register form: username,password,list and group

app.get('/register', (req, res) => {
 res.render('register',{})      
})

// user page
// shows: your username, users in group, the user you got assigned too

app.get('/list', (req, res) => {
 	var user = req.session.user;
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		res.render('list', {
			user: user
		});
	}
})

// ------------ posts --------- //

app.post('/register', (req,res) => {
	console.log(req.body)
	let list = [req.body.list1,req.body.list2,req.body.list3,req.body.list4,req.body.list5]
	console.log(list)
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
					list: list
				})
			})

		} else {
			// add group to user
			console.log(group)
			Users.create({
				username: req.body.username,
				password: req.body.password,
				list: list,
				groupId: group.id
			})
		}
	})
);
});

// login route
// req.session.user = user;
// res.redirect('/?message=' + encodeURIComponent("Please fill out your email address."));
		
app.post('/login', (req,res) => {
	let username = req.body.username 
	let password = req.body.password

	if(username !== undefined && password !== undefined) {
	Users.findOne({
		where: {
			username: username
		},
		raw: true
	}).then(function (user) {
		if(password === user.password){
			req.session.user = user
			res.redirect('/')
		}
		
	})
	}

})




















/*
app.post('/login', (req,res) => {
	if(req.body.username.length === 0) {
		res.redirect('/?message=' + encodeURIComponent("Please fill out your email address."));
		return;
	}

	if(req.body.password.length === 0) {
		res.redirect('/?message=' + encodeURIComponent("Please fill out your password."));
		return;
	}

	Users.findOne({
		where: {
			username: req.body.username
		}
	}).then(function (user) {
		if (user !== null && req.body.password === user.password) {
			req.session.user = user;
			res.redirect('/list');
		} else {
			res.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
		}
	}, function (error) {
		res.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
	});

})
*/

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
