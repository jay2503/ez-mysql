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
My.delete("temp", "id = 1").then(function () {
    console.log(My.lQ);
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

// Get Last fired Query
console.log(My.lQ);