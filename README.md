# jm-ez-mysql

## Overview
Easy MySQL Wrapper for NodeJS

## Installation
```sh
npm install jm-ez-mysql --save
```

## Examples
```js
var My = require("jm-ez-mysql");

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

// Insert Multiple Rows
My.insertMany("temp", [{
    name: 'Jay'
}, {
    name: 'Subham'
}]).then(function (result) {
    console.log(result.insertId)
})

// Update
My.update("temp", {
    name: 'Jayu'
}, "id = 2").then(function (result) {
    console.log(My.lQ);
})

// Update First
My.updateFirst("temp", {
    name: 'Jayu'
}, "id = 2").then(function (result) {
    console.log(My.lQ);
})

// Delete
My.delete("temp", "id = 6").then(function () {
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

// Update First using prepared statement
My.updateFirst("temp", {
    name: 'Jayu'
}, "id = ?", [id]).then(function (result) {
    console.log(My.lQ);
})

// Delete using prepared statement
My.delete("temp", "id = ?", [id]).then(function () {
    console.log(My.lQ);
})

//Select Query with where condition
const selectQuery = My.initQuery();
selectQuery.where('id', 1);
selectQuery.execute("table");

//Select Query with multiple where condition
const selectQuery = My.initQuery();
selectQuery.where('id', 1);
selectQuery.where('name', 'somename');
selectQuery.execute("table");


//Select Query with multiple(AND/OR) where condition
const selectQuery = My.initQuery();
selectQuery.where('id', 1);
selectQuery.orWhere('name', 'searchContent');
selectQuery.execute("table");
//query : SELECT  *  FROM table  WHERE id = 1   OR  name = 'searchContent';

//Select Query with multiple(AND/OR) with multple condition where condition
const selectQuery = My.initQuery();
selectQuery.where('(id = ? OR id = ?)', [1, 50]);
selectQuery.orWhere('name', 'searchContent');
selectQuery.execute("table");

//Another way to pass condition value
const selectQuery = My.initQuery();
newQuery.where('(id = ? OR id = ?)');
selectQuery.orWhere('name', 'searchContent');
selectQuery.execute("table", [1, 50]);
//query: SELECT  *  FROM table WHERE (id = 1 OR id = 50)  OR  name = 'searchContent';

//Select custom fields
const selectQuery = My.initQuery();
selectQuery.select('name, id, data'); // argument can be String|Array , Default is *
selectQuery.execute("table", [1, 50]);
//Query: SELECT name, id, data FROM table  WHERE 1=1

//Use joins : 

// Ex1. Left Join
const selectQuery = My.initQuery();
selectQuery.leftJoin("table2 as t2", "t2.t1ID = t1.id "); 
selectQuery.execute("table as t1");

// Query: SELECT  *  FROM table1 as t1 LEFT  JOIN table2 as t2 ON t2.t1ID = t1.id  WHERE 1=1;

// Ex2. Left and Right Join
const selectQuery = My.initQuery();
selectQuery.leftJoin("table2 as t2", "t2.t1ID = t1.id "); 
selectQuery.rightJoin("table3 as t3", "t3.t1ID = t1.id "); 
selectQuery.execute("table as t1");
//Query: SELECT  *  FROM table1 as t1 LEFT  JOIN table2 as t2 ON t2.t1ID = t1.id  RIGHT  JOIN table3 as t3 ON t3.t1ID = t1.id  WHERE 1=1;

// Ex3. Left Join with Condition
const selectQuery = My.initQuery();
selectQuery.leftJoin("table2 as t2", "t2.t1ID = t1.id AND t2.name = ? "); 
selectQuery.execute("table as t1", ['somename']);
//query: SELECT  *  FROM table as t1 LEFT  JOIN table2 as t2 ON t2.t1ID = t1.id AND t2.name = 'somename'  WHERE 1=1; 

// Ex4. Inner Join

const selectQuery = My.initQuery();
selectQuery.innerJoin("table2 as t2", "t2.t1ID = t1.id");
selectQuery.execute("table as t1");
// Query: SELECT  *  FROM table1 as t1 INNER  JOIN table2 as t2 ON t2.t1ID = t1.id  WHERE 1=1;

// Ex5.
const selectQuery = My.initQuery();
selectQuery.join("table2 as t2", "t2.t1ID = t1.id", "left"); // third argument will join type ex. (left, right, right outer, ...), default is inner
selectQuery.execute("table as t1");



//Use query as count
const selectQuery = My.initQuery();
selectQuery.select('name, id, data'); // argument can be String|Array , Default is *
selectQuery.where('(id = ? OR id = ?)', [1, 50]);
selectQuery.orWhere('name', 'searchContent');
selectQuery.execute("table", [], true); // If third argument will be true than last condition will remains and used for further process, like for count.
//Qeury: SELECT name, id, data FROM table  WHERE (id = 1 OR id = 50)  OR  name = 'searchContent'

selectQuery.count(); // argument can be any field name, default is id 
selectQuery.execute("table");
//Qeury: SELECT COUNT(table.id) as count  FROM table  WHERE (id = 1 OR id = 50) OR  name = 'searchContent'


//Use order by
const selectQuery = My.initQuery();
selectQuery.orderBy('id', 'ASC');
selectQuery.orderBy('name', 'DESC');
selectQuery.execute("table");
//Query: SELECT  *  FROM table  WHERE 1=1 ORDER BY id ASC, name DESC

//Use group by
const selectQuery = My.initQuery();
selectQuery.groupBy('id'); //
selectQuery.execute("table");
//Query:SELECT  *  FROM table  WHERE 1=1 GROUP BY id 

//Use Limit 
const selectQuery = My.initQuery();
selectQuery.skip(2); // records want to skip
selectQuery.limit(10);
selectQuery.execute("table");
//Query:SELECT  *  FROM table  WHERE 1=1 LIMIT 2, 10


// Get Last fired Query
console.log(My.lQ);

```

## License
The MIT License (MIT)