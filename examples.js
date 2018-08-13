// var My = require("jm-ez-mysql");
var My = require('./index.js');

// Init DB Connection
My.init({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'psu',
});

// Select All
My.findAll("psu_project", ["id"], "1=1").then(function (r) {
    console.log(r)
})

// Select All with count
My.findAllWithCount("psu_project", "id", ["id"], "1=1", "LIMIT 0, 5").then(function (r) {
    console.log(r)
})

// Select First
My.first("psu_project", ["id"], "1=1 ").then(function (r) {
    console.log(r);
});

// Insert
My.insert("temp", {
    name: 'Jay'
}).then(function (result) {
    console.log(result.insertId)
})

// Update
My.update("temp", {
    name: 'Jayu'
}, "id = 2").then(function (result) {
    console.log(My.lQ);
})

// Delete
My.delete("temp", "id = ?").then(function () {
    console.log(My.lQ);
})

// Pure MySQL Query
var id = "'4";
My.findRaw("select * from psu_project where id = " + My.escape(id))
    .then(function (results) {
        console.log('My query results', results);
        console.log('Lq', My.lQ);
    })
    .catch(function (err) {
        console.log(err);
    });

// Pure MySQL Query as Formatted String
var id = "'4";
My.query("select * from psu_project where id = ?", [id])
    .then(function (results) {
        console.log('My query results', results);
        console.log('Lq', My.lQ);
    })
    .catch(function (err) {
        console.log(err);
    });

// Select All using prepared statement
My.findAll("psu_project", ["id"], "id=?", [id]).then(function (r) {
    console.log(r)
})

// Select All with count using prepared statement
My.findAllWithCount("psu_project", "id", ["id"], "id=?", "LIMIT 0, 5", ["id"]).then(function (r) {
    console.log(r)
})

// Select First using prepared statement
My.first("psu_project", ["id"], "1=? ", [id]).then(function (r) {
    console.log(r);
});

// Update using prepared statement
My.update("temp", {
    name: 'Jayu'
}, "id = ?", [id]).then(function (result) {
    console.log(My.lQ);
})

// Delete using prepared statement
My.delete("temp", "id = ?", [id]).then(function () {
    console.log(My.lQ);
})

// Get Last fired Query
console.log(My.lQ);