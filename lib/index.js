const mysql = require('mysql');

class Sqll {
    constructor(config){ 
        /**
         config = {
            host     : 'localhost',
            user     : 'root',
            password : '',
            database : 'sqll'
          }
         */
        
        this.connection = mysql.createConnection(config);
        //   this.query('SELECT * FROM usuario');
        //   this.set({
        //       produto: [
        //         {
        //             cod: 1112,
        //             descricao: 'Banheiro1',
        //             usuario: '1'
        //         },
        //         {
        //             cod: 1113,
        //             descricao: 'Banheiro2',
        //             usuario: '1'
        //         }
        //       ]
        //   })
        // this.update({
        //     produto: {
        //         values: {
        //             descricao: 'Vazo'
        //         },
        //         where: [
        //             ['cod', '=', '1111']
        //         ]
        //     }
        // })

        // this.delete({
        //     produto: {
        //         where: 
        //         [
        //             'cod', '=', '1111'
        //         ]
        //     }
        // })

        //   this.get({
        //       produto:{
        //         filds: ['id.idproduto', 'descricao','cod'],
        //         // where:[
        //         //     ['id', '=', '1'],
        //         //     'OR',
        //         //     ['id', '=', '2']
        //         // ],
        //         // order: ['cod DESC'],
        //         group: [],
        //         limit: [],
        //       },
        //       usuario: {
        //         key: 'usuario',
        //         filds: ['id.idusuario', 'nome', 'idade']
        //       },
        //   })

    }

    query(sql){
        return new Promise(
            (sucesso, falha) => {
                this.connection.query(sql, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        falha(error);
                        return false;
                    };
                    console.log(results);
                    sucesso(results);
                    return true;
                  });
            }
        )
    }

    delete(obj){
        let table = Object.keys(obj)[0];
        let where = [];
        let _where = obj[table].where;
        if(_where)
            if(_where.length)
                _where.map(
                    (value, i) => {
                        if(typeof value == 'string'){
                            where.push(value);
                            return true;
                        }
                        let sql = `${table}.${value[0]} ${value[1]} ${this.connection.escape(value[2])}`;
                        if(i > 0){
                            if(typeof _where[i - 1] != 'string')
                                sql = 'AND ' + sql;
                        } 
                        where.push(sql)
                    }
                )
        let sql = `DELETE FROM ${table} 
                   ${where.length > 0 ? 'WHERE ' + where.join(' ') : ''} `;
        return this.query(sql);
    }
    update(obj){
        let table = Object.keys(obj)[0];
        let where = [];
        let values = [];
        for(let key in obj[table].values){
            values.push(`${key} = ${this.connection.escape(obj[table].values[key])}`);
        }
        let _where = obj[table].where;
        if(_where)
            if(_where.length)
                _where.map(
                    (value, i) => {
                        if(typeof value == 'string'){
                            where.push(value);
                            return true;
                        }
                        let sql = `${table}.${value[0]} ${value[1]} ${this.connection.escape(value[2])}`;
                        if(i > 0){
                            if(typeof _where[i - 1] != 'string')
                                sql = 'AND ' + sql;
                        } 
                        where.push(sql)
                    }
                )
        let sql = `UPDATE ${table} 
                   SET ${values.join(',')} 
                   ${where.length > 0 ? 'WHERE ' + where.join(' ') : ''} `;
        return this.query(sql);
    }
    set(obj){
        let table = Object.keys(obj)[0];
        let coluns = [];
        let values = [];
        let sql = `INSERT INTO ${table} `
        if(Array.isArray(obj[table])){
            for(let key in obj[table][0]){
                coluns.push(key);
            }
            obj[table].map(
                value => {
                    let valores = [];
                    for(let _key in value){
                        valores.push(this.connection.escape(value[_key]));
                    }
                    values.push(`(${valores.join(',')})`);
                }
            )
            sql = `${sql} (${coluns.join(',')})  VALUES ${values.join(',')} `;

        } else {
            for(let key in obj[table]){
                coluns.push(key);
                values.push(this.connection.escape(obj[table][key]));
            }
            sql = `${sql} (${coluns.join(',')})  VALUES (${values.join(',')}) `;
        }

        return this.query(sql);
    }
    get(obj){
        let tables = Object.keys(obj);
        let campos = [];
        let where = [];
        let group = [];
        let order = [];
        let limit = [];
        let campos_scapes = [];
        let from = tables.map(
            (value, i) => {
                if(i > 0){
                    let chave_anterior = tables[i - 1];
                    if(obj[value]._key)
                        return `JOIN ${value} ON ${value}.${obj[value].exkey ? obj[value].exkey : 'id'} = ${obj[value]._key}`
                    return `JOIN ${value} ON ${value}.id = ${chave_anterior}.${obj[value].key}`
                } else {
                    return value
                }
            }
        )
        for(let name in obj){
            let _campos = obj[name].filds;
            let _where = obj[name].where;
            let _group = obj[name].group;
            let _order = obj[name].order;
            let _limit = obj[name].limit;
            if(_group)
                if(_group.length > 0)
                    _group.map(
                        value => group.push(
                            `${name}.${value}`
                        )
                    );
            if(_limit)
                if(_limit.length > 0)
                    _limit.map(
                        value => limit.push(
                            value
                        )
                    );

            if(_order)
                if(_order.length > 0)
                    _order.map(
                        value => order.push(
                            `${name}.${value}`
                        )
                    )

            if(_where)
                if(_where.length)
                _where.map(
                    (value, i) => {
                        if(typeof value == 'string'){
                            where.push(value);
                            return true;
                        }
                        let sql = `${name}.${value[0]} ${value[1]} ${this.connection.escape(value[2])}`;
                        if(i > 0){
                            if(typeof _where[i - 1] != 'string')
                                sql = 'AND ' + sql;
                        } 
                        where.push(sql)
                    }
                )
            _campos.map(
                value => {
                    let as = value.split('.');
                    return campos.push(`${name}.${as.length > 1 ? as[0] + ' AS ' + as[1] : value }`);
                }
            )
        }
        let sql = `SELECT ${campos.join(',')} 
                   FROM ${from.join(' ')} 
                   ${where.length > 0 ? 'WHERE ' + where.join(' ') : ''} 
                   ${group.length ? 'GROUP BY ' + group.join(',') : ''} 
                   ${order.length ? 'ORDER BY ' + order.join(',') : ''} 
                   ${limit.length ? 'LIMIT ' + limit.join(',') : ''} 
                   `;
        console.log(sql.split('\n').join(' ').trim());
        return this.query(sql);
    }
}

module.exports = Sqll;
