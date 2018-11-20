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

// makes it recreate the tables every restart(if set to true)

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
	if(!user) {
		res.redirect('/')
		return
	}
	console.log('not running')

	Users.findAll({ where: { groupId : user.groupId}, raw: true}).then(users => {
		res.render('list', {		
		user: user,
		users: users
		});
	console.log(users)	
	})
		
	
})

// ------------ posts --------- //

app.post('/register', (req,res) => {
	console.log(req.body)
	let list = [req.body.list1,req.body.list2,req.body.list3,req.body.list4,req.body.list5]
	console.log(list)	

			// create new entry in database
			Groups.findOrCreate({where: {
				name: req.body.group,
				max: 14
			}}).spread((group, created) => {
				console.log('group')    
				console.log(group)
				group.createUser({
				username: req.body.username,
				password: req.body.password,
				list: list,
				groupId: group.id
				}).then((user) => {
					req.session.user = user.dataValues
					res.redirect('/')
				})
			})
})


/*
.then(user => {
	req.session.user = used.dataValues
	res.redirect('/')
			})



// login route
// req.session.user = user;
// res.redirect('/?message=' + encodeURIComponent("Please fill out your email address."));
*/	
app.post('/login', (req,res) => {
	let username = req.body.username 
	let password = req.body.password

	if(username !== undefined && password !== undefined) {
	Users.findOne({
		where: {
			username: username
		},
		raw: true,
		include: [Groups]
	}).then(function (user) {
		if(password === user.password){
			req.session.user = user
			res.redirect('/')
		}
		
	})
	}

})

// generate user link
/*
get users
if users.length > group max
for loop
math.floor(math.random*group.max)
*/
app.post('/randomizer', (req,res) => {
	let user = req.session.user
	console.log(user['group.max'])
	let taken = []

	function randomizer() {
			let random = Math.floor(Math.random()) 
			while(taken.indexOf(random) !== -1) {
				random = Math.floor(Math.random())
			 }
			 if(taken.indexOf(random) == -1) {
				taken.push(random)
				return random
			}	 	
	}

	Users.findAll({where: {groupId: user.groupId }, raw: true}).then( users => {
		if(users.length <= user['group.max']) {
		for(i=0;i < users.length; i++) {
			
		
		}
		} else {
			res.send('sorry, user amount not reached yet')
		}
	})

})

/*
if(!user) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
		return;
	}
*/





app.listen(port, () => console.log(`Example app listening on port ${port}!`))
