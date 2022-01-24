from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def front():
    return render_template("wrapper.html")

@app.route("/wrapped")
def wrapped():
    return render_template("index.html")