const conn = require('../../connection/database');

//Function untuk mengambil data pasien
exports.getDataPasien = async (coloum = "", where = [], data = [], order = "", limit = 0, offset = 0) => {
    let sql = 'SELECT';

    if(coloum === ''){
        sql += ' * ';
    }else{
        sql += ` ${coloum} `;
    }

    sql += 'FROM tbh_pasien';

    if(where.length !== 0){
        sql += ' WHERE ' + where.join(' AND ');

        sql += (order != "") ? ` ${order}` : "";

        if(limit != 0){
            if(offset != 0){
                sql += ` LIMIT ${offset}, ${limit}`
            }else{
                sql += ` LIMIT ${limit}`
            }
        }

        console.log(sql);
        return new Promise((resolve, reject)=>{
            conn.query(sql,
                data,
                (e, r) => {
                    if(e) return reject(e);
                    resolve(r);
                }
            );
        });
        
        
    }else{
        sql += (order != "") ? ` ${order}` : "";
        
        if(limit != 0){
            if(offset != 0){
                sql += ` LIMIT ${offset}, ${limit}`
            }else{
                sql += ` LIMIT ${limit}`
            }
        }

        console.log(sql);
        return new Promise((resolve, reject)=>{
            conn.query(sql,
                (e, r) => {
                    if(e) return reject(e);
                    resolve(r);
                }
            );
        });
        
    }
}

//Function untuk menyimpan data pasien
exports.create = async (data = {}) => {
    if((Object.keys(data).length === 0 && data.constructor === Object)){
        throw "Varibel data yang anda berikan kosong";
    }

    let field = [];
    let tempField = [];
    let valField = [];

    for(let key in data){
        field.push(key);
        tempField.push('?');
        valField.push(data[key]);
    }

    let sql = `INSERT INTO tbh_pasien (${field.join(',')}) VALUES (${tempField.join(',')})`;
    return new Promise((resolve, reject)=>{
        conn.query(sql,
            valField,
            (e, r) => {
                if(e) return reject(e);
                resolve(r);
            }
        );
    });
}

//Function untuk update data pasien berdasarkan id
exports.update = async (data = {}, where = {}) => {
    if((Object.keys(data).length === 0 && data.constructor === Object)){
        throw "Varibel data yang anda berikan kosong";
    }

    let field = [];
    let value = [];

    for(let key in data){
        field.push(key + " = ?");
        value.push(data[key]);
    }

    value.push(where.id);

    return new Promise((resolve, reject)=>{
        let sql = `UPDATE tbh_pasien SET ${field.join(',')} WHERE id = ?`;
        conn.query(sql,
            value,
            (e, r) => {
                if(e) return reject(e);
                resolve(r);
            }
        );
    });
}

//Function untuk hapus data pasien berdasarkan id
exports.delete = async (data = {}) => {
    if((Object.keys(data).length === 0 && data.constructor === Object)){
        throw "Varibel data yang anda berikan kosong";
    }

    return new Promise((resolve, reject)=>{
        
        let sql = 'DELETE FROM tbh_pasien WHERE id = ?';
        conn.query(sql,
            [data.id],
            (e, r) => {
                if(e) return reject(e);
                resolve(r);
            }
        );
    });
}

//Function untuk mengambil data jumlah pasien covid perhari
exports.grafikSatu = async () => {
    return new Promise((resolve, reject) => {
        conn.query(
            "SELECT tanggal, COUNT(*) AS jumlah FROM  tbh_pasien GROUP BY tanggal",
            (e, r) => {
                if(e) return reject(e);
                resolve(r);
            }
        );
    });
}

//Function untuk mengambil data jumlah pasien covid berdasarkan status
exports.grafikTiga = async () => {
    return new Promise((resolve, reject) => {
        conn.query(
            "SELECT status, COUNT(*) AS jumlah FROM  tbh_pasien GROUP BY status",
            (e, r) => {
                if(e) return reject(e);
                resolve(r);
            }
        );
    });
}

//Function untuk mengambil data jumlah pasien covid positif tiap hari
exports.jumlahPasienPositifPerhari = async () => {
    return new Promise((resolve, reject) => {
        conn.query(
            "SELECT tanggal AS 'tanggal', COUNT(*) AS 'jumlahPasienPositif' FROM  tbh_pasien GROUP BY tanggal",
            (e, r) => {
                if(e) return reject(e);
                resolve(r);
            }
        );
    });
}

//Function untuk mengambil data jumlah pasien covid per hari
exports.jumlahPasienPositifPerhari = async () => {
    return new Promise((resolve, reject) => {
        conn.query(
            "SELECT tanggal AS 'tanggal', COUNT(*) AS 'Positif' FROM  tbh_pasien GROUP BY tanggal",
            (e, r) => {
                if(e) return reject(e);
                resolve(r);
            }
        );
    });
}

//Function untuk mengambil data jumlah pasien covid berdasarkan tanggal dan status
exports.jumlahPasienPerstatus = (data = {}) => {
    return new Promise((resolve, reject) => {
        conn.query(
            "SELECT COUNT(*) AS jumlah FROM tbh_pasien WHERE tanggal = ? AND status = ?",
            [data.tanggal, data.status],
            (e, r)=>{
                if(e) return reject(e);
                resolve(r);
            }
        );
    });
}

