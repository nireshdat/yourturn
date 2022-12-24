var session = require('express-session');
const { v4: uuidv4, validate: uuidValidate } = require('uuid');
var cookieParser = require("cookie-parser");
const sessionStore = require('express-session-rsdb');
const functions = require("firebase-functions");
const admin = require('firebase-admin');
const app = require('express')();

app.use(cookieParser());
admin.initializeApp();	
database = admin.database();


app.get('/', (req, res) => {
  	if (req.cookies === undefined) {
        res.send("<p>no cookies</p>");
        return;
    }
    if (req.cookies.__session === undefined) {
        res.cookie("__session", uuidv4(), { secure: true });
    }
  	res.redirect("/widget.html");
});


app.get('/goto-browser', (req, res) => {
	if (req.headers['user-agent'].includes('FBAV')) {
    	res.writeHead(200, {
    		'Access-Control-Allow-Origin' : 'https://www.yourturn2022.com',
    		'Content-Type': "image/png",
    		'Content-disposition': 'attachment;filename=your_turn.png',
    		'Content-Length': 0,
    	});
    	res.end('');
    }
    else {
    	res.redirect("https://www.yourturn2022.com/welcome");
    }
});

app.post('/sendinspiration', (req, res) => {
	uuid = req.cookies.__session;
	if (uuidValidate(uuid) && 
		req.body.name !== undefined && 
		req.body.title !== undefined &&
		req.body.description !== undefined &&
		req.body.name !== "test") {
		var inspirationsRef = database.ref("inspirations");
		var newInspirationRef = inspirationsRef.push();
		newInspirationRef.set({
			'name': req.body.name,
			'title': req.body.title,
			'description': req.body.description,
			'session': uuid,
			'time': Date.now()
		});
		var counterRef = database.ref("counter");
		counterRef.set(admin.database.ServerValue.increment(1));
	}
	else {
		console.log(
			"Invalid request: uuid - " + uuid + 
			", name - " + req.body.name +
			", title - " + req.body.title +
			", description - " + req.body.description
		);
	}
	res.json({result: `Success`});
});


exports.app = functions.https.onRequest(app);