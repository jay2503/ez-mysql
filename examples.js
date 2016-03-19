var My = require('./index.js');

My.init({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'psu',
});

// Ohh!
My.insert("temp", {
    name: 'Jay'
}).then(function (result) {
    console.log(result.insertId)
})

return;

My.first("psu_project", ["id"], "1=1 ").then(function (r) {
    console.log(r);
});

My.findAll("psu_project", ["id"], "1=1").then(function (r) {
    console.log(r)
})

// Pure MySQL Query
var id = "'4";
My.query("select * from psu_project where id = " + My.escape(id))
    .then(function (results) {
        console.log('My query results', results);
        console.log('Lq', My.lQ);
    })
    .catch(function (err) {
        console.log(err);
    });


My.query("select * from psu_project where id = ?", [id])
    .then(function (results) {
        console.log('My query results', results);
        console.log('Lq', My.lQ);
    })
    .catch(function (err) {
        console.log(err);
    });