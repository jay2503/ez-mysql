var Q = require('Q'),
    Mysql = require('mysql');

var jmEzMySQL = {
    public: {
        lastQuery: '',
        lQ: ''
    }
}

/**
 * Init MySQL Database
 * @param {object} options
 * @public
 */
jmEzMySQL.public.init = function (options) {
    var _self = jmEzMySQL;
    options.connectionLimit = options.connectionLimit ? options.connectionLimit : 5;
    _self.pool = Mysql.createPool(options);
}

jmEzMySQL.setLastQuery = function (q) {
    var _self = jmEzMySQL;
    _self.public.lQ = _self.public.lastQuery = q;
}

jmEzMySQL.connection = function () {
    var _self = jmEzMySQL;
    return Q.promise(function (resolve, reject) {
        if (!_self || !_self.pool) return reject(new Error('Unexpected Error, Please check your database connection settings and make sure you have init MySQL'));
        _self.pool.getConnection(function (err, connection) {
            return err ? reject(err) : resolve(connection);
        });
    });
}

/**
 * Escape User Input
 * @param {string} input
 * @public
 */
jmEzMySQL.public.escape = Mysql.escape;

/**
 * Escape DB table and fields as `tablename`
 * @param {string} tablename
 * @public
 */
jmEzMySQL.public.escapeId = Mysql.escapeId;

/**
 * Select by Formatted Raw Query
 * @param {string} query
 * @param {array} values
 * @public
 */
jmEzMySQL.public.query = function (query, values) {
    var _self = jmEzMySQL;
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

jmEzMySQL.prepareQuery = function (tablesAndJoin, fields, where) {
    var fList = "";
    if (typeof fields == 'object') {
        fList = fields.join(', ');
    } else {
        fList = fields;
    }

    return "SELECT " + fList + " FROM " + tablesAndJoin + " WHERE " + (where ? where : '1=1')
}

/**
 * Select all
 * @param {string} tablesAndJoin
 * @param {array} fields
 * @param {string} where
 * @public
 */
jmEzMySQL.public.findAll = function (tablesAndJoin, fields, where) {
    var _self = jmEzMySQL;
    var q = _self.prepareQuery(tablesAndJoin, fields, where);
    return _self.public.query(q);
}

/**
 * Select by Raw query
 * @param {string} query
 * @public
 */
jmEzMySQL.public.findRaw = function (rawQuery) {
    var _self = jmEzMySQL;
    return _self.public.query(rawQuery);
}

/**
 * Select first
 * @param {string} tablesAndJoin
 * @param {array} fields
 * @param {string} where
 * @public
 */
jmEzMySQL.public.first = function (tablesAndJoin, fields, where) {
    var _self = jmEzMySQL;
    var q = _self.prepareQuery(tablesAndJoin, fields, where) + " LIMIT 0,1";

    return Q.promise(function (resolve, reject) {
        _self.public.query(q).then(function (results) {

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

/**
 * Insert
 * @param {string} table
 * @param {object} data
 * @public
 */
jmEzMySQL.public.insert = function (table, data) {
    var _self = jmEzMySQL;
    var query = 'INSERT INTO ' + Mysql.escapeId(table) + ' SET ?';
    return _self.public.query(query, data);
}

/**
 * Replace
 * @param {string} table
 * @param {object} data
 * @public
 */
jmEzMySQL.public.replace = function (table, data) {
    var _self = jmEzMySQL;
    var query = 'REPLACE INTO ' + Mysql.escapeId(table) + ' SET ?';
    return _self.public.query(query, data);
}

/**
 * Update
 * @param {string} table
 * @param {object} data
 * @param {string} where
 * @public
 */
jmEzMySQL.public.update = function (table, data, where) {
    var _self = jmEzMySQL;
    var query = 'UPDATE ' + Mysql.escapeId(table) + ' SET ? WHERE ' + (where ? where : '1=1');
    var values = [data];
    return _self.public.query(query, values);
}

/**
 * Delete
 * @param {string} table
 * @param {string} where
 * @public
 */
jmEzMySQL.public.delete = function (table, where) {
    var _self = jmEzMySQL;
    var query = 'DELETE FROM ' + Mysql.escapeId(table) + ' WHERE ' + (where ? where : '1=1');
    return _self.public.query(query);
}

jmEzMySQL.public.testConnecttion = function () {
    var _self = jmEzMySQL;
    return Q.promise(function (resolve, reject) {
        _self.connection()
            .then(function (connection) {
                connection.release();
                resolve("Works!");
            })
            .catch(function (err) {
                reject(err);
            });
    });
}

module.exports = jmEzMySQL.public;