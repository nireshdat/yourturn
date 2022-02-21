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
        res.cookie("__session", uuidv4(), { secure: true, sameSite: "none"});
    }
  	res.redirect("/widget.html");
});


app.post('/sendinspiration', (req, res) => {
	uuid = req.cookies.__session;
	if (uuidValidate(uuid) || 
		req.body.name === undefined || 
		req.body.title === undefined ||
		req.body.description === undefined) {
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