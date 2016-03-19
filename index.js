var Q = require('Q'),
    Mysql = require('mysql');

var jmEzMySQL = {
    public: {}
}

jmEzMySQL.public.init = function (options) {
    options.connectionLimit = options.connectionLimit ? options.connectionLimit : 5;
    this.pool = Mysql.createPool(options);
    this.lastQuery = this.lQ = '';
}

jmEzMySQL.setLastQuery = function (q) {
    this.lQ = this.lastQuery = q;
}

jmEzMySQL.connection = function () {
    var _self = this;
    return Q.promise(function (resolve, reject) {
        if (!_self || !_self.pool) return reject(new Error('Unexpected Error, Please check your database connection settings and make sure you have init MySQL'));
        _self.pool.getConnection(function (err, connection) {
            return err ? reject(err) : resolve(connection);
        });
    });
}

jmEzMySQL.public.escape = Mysql.escape;

jmEzMySQL.public.query = function (query, values) {
    var _self = this;
    return Q.promise(function (resolve, reject) {
        _self.connection()
            .then(function (connection) {
                var processed = connection.query(query, values, function (err, results) {
                    connection.release();
                    return err ? reject(err) : resolve(results);
                });
                _self.setLastQuery(processed.sql);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}

jmEzMySQL.public.findAll = function (tablesAndJoin, fields, where) {
    var q = this.prepareQuery(tablesAndJoin, fields, where);
    return this.query(q);
}

jmEzMySQL.public.findRaw = function (rawQuery) {
    return this.query(q);
}

jmEzMySQL.prepareQuery = function (tablesAndJoin, fields, where) {
    var fList = "";
    if (typeof fields == 'object') {
        fList = fields.join(', ');
    } else {
        fList = fields;
    }

    return "SELECT " + fList + " FROM " + tablesAndJoin + " WHERE " + where;
}

jmEzMySQL.public.first = function (tablesAndJoin, fields, where) {
    var _self = this;
    var q = _self.prepareQuery(tablesAndJoin, fields, where) + " LIMIT 0,1";

    return Q.promise(function (resolve, reject) {
        _self.query(q).then(function (results) {

            if (results.length > 0) {
                resolve(results[0]);
            } else {
                resolve(false);
            }
        }).catch(function (err) {
            reject(err);
        })
    })
}

jmEzMySQL.public.insert = function (table, data) {
    var query = 'INSERT INTO ' + Mysql.escapeId(table) + ' SET ?';
    return this.query(query, data);
}

jmEzMySQL.public.update = function (table, data, where) {
    var query = 'UPDATE ' + Mysql.escapeId(table) + ' SET ? WHERE ' + (where ? where : '1=1');
    var values = [record];
    return this.query(query, values);
}

jmEzMySQL.public.delete = function (table, where) {
    var query = 'DELETE FROM ' + Mysql.escapeId(table) + ' WHERE ' + (where ? where : '1=1');
    return this.query(query);
}

module.exports = jmEzMySQL.public;