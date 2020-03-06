var Q = require('q'),
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
 * Format Query
 * @param {sql} input
 * @param {inserts} input
 * @public
 */
jmEzMySQL.public.format = Mysql.format;

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
                    connection.destroy();
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

jmEzMySQL.prepareQueryWithCount = function (tablesAndJoin, countColumn, fields, where, additional) {
    var fList = "";
    if (typeof fields == 'object') {
        fList = fields.join(', ');
    } else {
        fList = fields;
    }

    return "SELECT " + fList + " FROM " + tablesAndJoin + " WHERE " + (where ? where : '1=1 ') + additional + ";" + "SELECT " + "count( " + countColumn + " ) as total" + " FROM " + tablesAndJoin + " WHERE " + (where ? where : '1=1');
}

/**
 * Select all
 * @param {string} tablesAndJoin
 * @param {array} fields
 * @param {string} where
 * @param {string} values
 * @public
 */
jmEzMySQL.public.findAll = function (tablesAndJoin, fields, where, values) {
    var _self = jmEzMySQL;
    var q = _self.prepareQuery(tablesAndJoin, fields, where);
    return _self.public.query(q, values);
}

/**
 * Select all
 * @param {string} tablesAndJoin
 * @param {string} countColumn
 * @param {array} fields
 * @param {string} where
 * @param {string} additional operations
 * @param {string} values
 * @public
 */

jmEzMySQL.public.findAllWithCount = async function (tablesAndJoin, countColumn, fields, where, additional, values) {
    var _self = jmEzMySQL;
    var q = _self.prepareQueryWithCount(tablesAndJoin, countColumn, fields, where, additional);
    const [result, count] = await _self.public.query(q, values ? values.concat(values) : null);
    return { result, count: count.length > 0 ? count[0].total : 0 };
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
 * @param {string} values
 * @public
 */
jmEzMySQL.public.first = function (tablesAndJoin, fields, where, values) {
    var _self = jmEzMySQL;
    var q = _self.prepareQuery(tablesAndJoin, fields, where) + " LIMIT 0,1";

    return Q.promise(function (resolve, reject) {
        _self.public.query(q, values).then(function (results) {

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
 * Insert Multiple Rows
 * @param {string} table
 * @param {object} data
 * @public
 */
jmEzMySQL.public.insertMany = function (table, data) {
    var _self = jmEzMySQL;
    const columns = Object.keys(data[0]);
    const dataArr = [];
    data.forEach((d) => {
        dataArr.push(Object.values(d));
    });
    var query = 'INSERT INTO ' + Mysql.escapeId(table) + ` (${columns}) VALUES ?`;
    return _self.public.query(query, [dataArr]);
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
 * @param {string} values
 * @public
 */
jmEzMySQL.public.update = function (table, data, where, values) {
    var _self = jmEzMySQL;
    var query = 'UPDATE ' + Mysql.escapeId(table) + ' SET ? WHERE ' + (where ? where : '1=1');
    var _values = [data].concat(values);
    return _self.public.query(query, _values);
}

/**
 * Update
 * @param {string} table
 * @param {object} data
 * @param {string} where
 * @param {string} values
 * @public
 */
jmEzMySQL.public.updateFirst = function (table, data, where, values) {
    var _self = jmEzMySQL;
    var query = 'UPDATE ' + Mysql.escapeId(table) + ' SET ? WHERE ' + (where ? where : '1=1') + ' LIMIT 1';
    var _values = [data].concat(values);
    return _self.public.query(query, _values);
}

/**
 * Delete
 * @param {string} table
 * @param {string} where
 * @param {string} values
 * @public
 */
jmEzMySQL.public.delete = function (table, where, values) {
    var _self = jmEzMySQL;
    var query = 'DELETE FROM ' + Mysql.escapeId(table) + ' WHERE ' + (where ? where : '1=1');
    return _self.public.query(query, values);
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

const _prepareJoinStatement = function _prepareJoinStatement(joinName, property, condition) {
    if (property && condition) {
        this.joins.push(`${ (joinName || 'inner').toUpperCase()} JOIN ` + property + ' ON ' + condition);
    }
}

/**
 * INNER JOIN
 * @param {string} tableJoinName
 * @param {String} tableJoinCondition
 * @public
 */
const innerJoin = function (tableJoinName, tableJoinCondition) {
    _prepareJoinStatement.apply(this, ['inner', tableJoinName, tableJoinCondition]);
}
/**
 * LEFT JOIN
 * @param {string} tableJoinName
 * @param {String} tableJoinCondition
 * @public
 */
const leftJoin = function (tableJoinName, tableJoinCondition) {
    _prepareJoinStatement.apply(this, ['left ', tableJoinName, tableJoinCondition]);
}
/**
 * RIGHT JOIN
 * @param {string} tableJoinName
 * @param {String} tableJoinCondition
 * @public
 */
const rightJoin = function (tableJoinName, tableJoinCondition) {
    _prepareJoinStatement.apply(this, ['right ', tableJoinName, tableJoinCondition]);
}
/**
 * JOIN (Default : INNER)
 * @param {string} tableJoinName
 * @param {String} tableJoinCondition
 * @public
 */
const join = function (tableJoinName, tableJoinCondition, joinType) {
    _prepareJoinStatement.apply(this, [`${joinType || ''}`, tableJoinName, tableJoinCondition]);
}


const _prepareConditionalQuery = (where, values) => {
    // check if condition having replacement symbol or not
    where.indexOf('?') === -1 && (where = `${where} = ? `);
    if (!values) return where;
    let conditionValues = [];
    if (values) {
        conditionValues = typeof values == 'object' ? values : [values];
    }
    // '?' will replace with actual values
    for (let i = 0; i < conditionValues.length; i++) {
        where = where.replace('?', Mysql.escape(conditionValues[i]));
    }
    return where;
}
/**
 * WHERE 
 * @param {string} fieldName
 * * @param {Array|String} values
 * @param {boolean} shouldBracketContains
 * @public
 */

const where = function (fieldName, values) {
    if (!fieldName) {
        throw new Error('Missing first argument fieldName.');
        return;
    } 
    this.whereStatement.push(_prepareConditionalQuery(fieldName, values));
    
}
/**
 * OR WHERE 
 * @param {string} fieldName
 * @param {Array | String} values
 * @public
 */
const orWhere = function (fieldName, values) {
    if (!fieldName) {
        throw new Error('Missing first argument fieldName.');
        return;
    } 
    this.orWhereStatement.push(_prepareConditionalQuery(fieldName, values));
}
/**
 * SELECT FIELDS
 * @param {string || array} fields
 * @public
 */
const select = function (fields) {
    fields && (this.selectFields =  (fields == 'object' ? fields.join(', '): fields));
}
/**
 * SET COUNT ON FIELD NAME
 * @param {string} fieldName
 * @public
 */
const count = function (fieldName) {
    this.countField =  `COUNT(${fieldName || 'id'}) as count `;
}
/**
 * SET GROUP BY
 * @param {string } groupBy
 * @public
 */
const groupBy = function (groupBy) {
    this.groupByFields = groupBy;
}
/**
 * SET ORDER BY
 * @param {string } orderBy
 * @param {string } ordderType
 * @public
 */
const orderBy = function (orderBy, ordderType) {
    this.orderByFields.push(`${orderBy} ${ordderType || 'ASC'}`);
}
/**
 * SET SKIP
 * @param {number} skipVal
 * @public
 */
const skip = function (skipVal) {
    this.skipFieldValue = skipVal;
}
/**
 * SET LIMIT
 * @param {number} limitVal
 * @public
 */
const limit = function (limitVal) {
    this.limitFieldValue = limitVal;
}
/**
 * TRIGGER QUERY 
 * @param {string } from
 * @param { array } values
 * * @param { Boolean } skipReset
 * @public
 */
const execute = function (from, values, skipReset) {
    const _self = jmEzMySQL;
    let conditionStatement = '';
    
    // extract all parameter for query 
    const { whereStatement, 
            selectFields, 
            orWhereStatement,
            orderByFields, 
            groupByFields, 
            countField,
            skipFieldValue,
            limitFieldValue } = this;

    // IF where condition applied
    if (whereStatement.length > 0 ) {
            conditionStatement = whereStatement.join(' AND ');
    }
    // IF where condition applied with OR
    if (orWhereStatement.length > 0) {
        conditionStatement += ` ${ conditionStatement ? ' OR ': ''} ${orWhereStatement.join(' OR ')}`
    }
    const tableFields = countField ? countField : selectFields;
    let q = _self.prepareQuery(`${from} ${this.joins.join(' ')}`, tableFields, conditionStatement);
    
    // Add  Group by to query
    groupByFields && (q += ` GROUP BY ${groupByFields}`);
    
    // Add  Order by to query
    orderByFields.length > 0 && (q += ` ORDER BY ${orderByFields.join(', ')}`);
    
    // Set Limit INTO Query but query should not for count
    if (!countField && limitFieldValue) {
        q += ` LIMIT ${skipFieldValue || 0}, ${limitFieldValue}`;
    }
    
    // Reset query pararms like joins, where etx.
    !skipReset && resetInitQueryData.call(this);

    return _self.public.query(q, values);
    
}
const resetInitQueryData = function() {
    this.joins = [];
    this.whereStatement = [];
    this.orWhereStatement = [];
    this.selectFields = ' * ';
    this.groupByFields = '';
    this.orderByFields = [];
    this.countField = '';
    this.limitFieldValue = 0;
    this.skipFieldValue = 0;
}
/**
 * EXTEND CORE FEATURE
 * @public
 */
jmEzMySQL.public.initQuery = function () {
    const _self = {};
    _self.join = join;
    _self.leftJoin = leftJoin;
    _self.rightJoin = rightJoin;
    _self.innerJoin = innerJoin;
    _self.where = where;
    _self.orWhere = orWhere;
    _self.execute = execute;
    _self.select = select;
    _self.groupBy = groupBy;
    _self.orderBy = orderBy;
    _self.count = count;
    _self.skip = skip;
    _self.limit = limit;
    resetInitQueryData.call(_self);
    return _self;
}

module.exports = jmEzMySQL.public;
