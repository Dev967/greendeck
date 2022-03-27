const mysql = require('mysql');

const con = mysql.createConnection({
  host: "170.187.207.110",
  user: "greendeckhackathon",
  password: "wYoxmLIwVkoTd",
  port: 80,
  database: "cliff"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("CONNECTED TO DATABASE")
});

exports.connection = con;