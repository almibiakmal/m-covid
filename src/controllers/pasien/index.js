const modelPasien = require('../../models/pasien');
const validator = require('../../lib/validator');

pagination = async (pages, fields, where = [], data = []) => {
    let page = 1;
    let limit = 10;
    
    if(pages != undefined){
        let tempPage = parseInt(pages);
        console.log(`Pages: ${tempPage}`);
        if(tempPage > 0){
            page = tempPage;
        }
    }

    //Menghitung jumlah seluruh data pasien
    let jumlahData = await modelPasien.getDataPasien(fields, where, data);
    let totalPage = Math.ceil(jumlahData[0].jumlah / limit);

    return await {
        start : (page * limit) - limit,
        limit : limit,
        firstPage : (page <= 1) ? "disabled" : `href="${process.env.URL + process.env.PORT}/pasien?page=1"`,
        prevPage : (page > 1) ? `href="${process.env.URL + process.env.PORT}/pasien?page=${page - 1}"` : "disabled",
        page : page,
        nextPage : (page >= totalPage) ? "disabled" : `href="${process.env.URL + process.env.PORT}/pasien?page=${page + 1}"`,
        lastPage : (page >= totalPage) ? "disabled" : `href="${process.env.URL + process.env.PORT}/pasien?page=${totalPage}"`,
        totalPage: totalPage
    }
}

exports.index = async (req, res, next) => {

    let paging = await pagination(req.query.page, 'COUNT(*) AS jumlah');

    let data = await modelPasien.getDataPasien('*',[],[], 'ORDER BY tanggal DESC', paging.limit, paging.start);
    data.forEach((v, k)=>{
        let tgl = v.tanggal.split('-');
        data[k].tanggal = tgl[2] + "-" + tgl[1] + "-" + tgl[0];
    });

    res.render('index', {
        page: 'pages/pasien/index.ejs',
        data: data,
        status: null,
        usia: null,
        tglMulai: null,
        tglSelesai: null,
        pagination: paging,
        url: process.env.URL + process.env.PORT
    });

    next();
}

exports.search = async (req, res, next) => {

    //Variabel temp
    let data = [];
    let param = [];
    let rule = [];
    let msg = [];
    let paging;

    //Get data request
    let status = typeof req.body.status === 'undefined' || req.body.status == '' ? "" : req.body.status;
    let usia = typeof req.body.usia === 'undefined' || req.body.usia == '' ? 0 : parseInt(req.body.usia);
    let tglMulai = typeof req.body.tglMulai === 'undefined' || req.body.tglMulai == '' ? "" : req.body.tglMulai;
    let tglSelesai = typeof req.body.tglSelesai === 'undefined' || req.body.tglSelesai == '' ? "" : req.body.tglSelesai;

    if(status !== ''){
        data.push(status);
        param.push('status');
        rule.push(['inArray']);
        msg.push(['Status tidak valid']);
    }

    if(usia !== 0){
        data.push(usia);
        param.push('usia');
        rule.push(['bilanganBulat','intPositif']);
        msg.push(['Usia tidak boleh berkoma','Usia tidak boleh negatif']);
    }

    if(tglMulai !== ''){
        data.push(tglMulai);
        param.push('tglMulai');
        rule.push(['date']);
        msg.push(['Tanggal mulai tidak valid']);
    }

    if(tglSelesai !== ''){
        data.push(tglSelesai);
        param.push('tglSelesai');
        rule.push(['date']);
        msg.push(['Tanggal selesai tidak valid']);
    }

    //Melakukan validasi data input
    let error = await validator.validInput(data,param,rule,msg);
    console.log(error);

    if((tglMulai !== "" && tglSelesai !== "") && (error.length === 0)){
        if(new Date(tglMulai) >= new Date(tglSelesai)) {
            error.push({
                "param": "tglMulai",
                "message": "Tanggal mulai harus lebih kecil dari tanggal selesai"
            });
        }
    }

    if(error.length > 0){
        res.status(400).send({
            message: error
        });

    }else{
        let pasien;

        if(status === "" && usia === 0 && tglMulai === "" && tglSelesai === ""){
            // pasien = await modelPasien.getDataPasien();

            paging = await pagination(req.query.page, 'COUNT(*) AS jumlah');
            pasien = await modelPasien.getDataPasien('*',[],[], 'ORDER BY tanggal DESC', paging.limit, paging.start);

        }else{
            let fieldCondition = [];
            let dataCondition = [];

            if(status !== ''){
                fieldCondition.push('status = ?');
                dataCondition.push(status);
            }

            if(usia !== 0){
                fieldCondition.push('usia = ?');
                dataCondition.push(usia);
            }

            if(tglMulai !== ''){
                if(tglSelesai === ''){
                    fieldCondition.push('tanggal = ?');
                    dataCondition.push(tglMulai);
                }else{
                    fieldCondition.push('tanggal >= ?');
                    dataCondition.push(tglMulai);
                }
            }

            if(tglSelesai !== ''){
                if(tglMulai === ''){
                    fieldCondition.push('tanggal = ?');
                    dataCondition.push(tglSelesai);
                }else{
                    fieldCondition.push('tanggal <= ?');
                    dataCondition.push(tglSelesai);
                }
            }

            paging = await pagination(req.query.page, 'COUNT(*) AS jumlah', fieldCondition, dataCondition);
            // pasien = await modelPasien.getDataPasien('*',[],[], 'ORDER BY tanggal DESC', paging.limit, paging.start);
            pasien = await modelPasien.getDataPasien('*', fieldCondition, dataCondition, 'ORDER BY tanggal DESC', paging.limit, paging.start);
        }

        pasien.forEach((v, k)=>{
            let tgl = v.tanggal.split('-');
            pasien[k].tanggal = tgl[2] + "-" + tgl[1] + "-" + tgl[0];

        });

        console.log({
            status: status,
            usia: usia,
            tglMulai: tglMulai,
            tglSelesai: tglSelesai
        });
        res.render('index', {
            page: 'pages/pasien/index.ejs',
            data: pasien,
            status: status,
            usia: usia,
            tglMulai: tglMulai,
            tglSelesai: tglSelesai,
            pagination: paging,
            url: process.env.URL + process.env.PORT
        });
    }

    next();
}

exports.create = async (req, res, next) => {

    //Get data request
    let tanggal = typeof req.body.tanggal === 'undefined' ? "" : req.body.tanggal;
    let nomorPasien = typeof req.body.nomorPasien === 'undefined' ? "" : req.body.nomorPasien;
    let usia = typeof req.body.usia === 'undefined' ? 0 : parseInt(req.body.usia);
    let status = typeof req.body.status === 'undefined' ? "" : req.body.status;

    //Variabel temp
    let data = [tanggal, nomorPasien, usia, status];
    let param = ['tanggalForm','nomorPasienForm','usiaForm','statusForm'];
    let rule = [
        ['required','date'],
        ['required','format'],
        ['required','bilanganBulat','intPositif'],
        ['required','inArray']
    ];
    let msg = [
        ['Tanggal tidak boleh kosong','Tanggal tidak valid'],
        ['Nomor pasien tidak boleh kosong','Format nomor pasien yang betul adalah No_[angka]'],
        ['Usia tidak boleh kosong','Usia harus bilangan bulat','Usia tidak boleh negatif'],
        ['Status tidak boleh kosong','Status tidak valid']
    ];

    //Melakukan validasi data input
    let error = await validator.validInput(data,param,rule,msg);
    console.log(error);

    if(error.length > 0){
        res.status(400).send({
            field: error
        });

    }else{
        let result = await modelPasien.create({
            nomor_pasien: nomorPasien,
            usia: usia,
            tanggal: tanggal,
            status: status
        });

        if(result.insertId !== 'undefined' && result.insertId > 0){
            res.status(201).json({
                "success": true,
                "message": `Data pasien berhasil disimpan`
            });
        }else{
            res.status(400).send({
                message: `Data pasien dengan nomor pasien ${nomorPasien} gagal disimpan`
            });
        }
    }

    next();
}

exports.detail = async (req, res, next) => {
    //Get data request
    let id = typeof req.body.id === 'undefined' ? 0 : parseInt(req.body.id);
    
    let data = [id];
    let param = ['id'];
    let rule = [['bilanganBulat','intPositif']];
    let msg = [['Something wrong with request x','Something wrong with request y']];

    //Filter data yang dikirim user
    let error = await validator.validInput(data,param,rule,msg);
    
    if(error.length > 0){
        res.status(400).send({
            "message": error[0].message
        });
    }else{
        
        let pasien = await modelPasien.getDataPasien('id, tanggal, usia, status, nomor_pasien AS nomorPasien',['id = ?'],[id]);
        console.log(pasien);

        if(pasien.length === 1){
            res.status(200).json({
                "success": true,
                "data": pasien
            });
        }else{
            res.status(400).send({
                "message": "Data tidak ditemukan"
            });
        }

    }
    next();
}

exports.update = async (req, res, next) => {

    //Get data request
    let id = typeof req.body.id === 'undefined' ? 0 : parseInt(req.body.id);
    let tanggal = typeof req.body.tanggal === 'undefined' ? "" : req.body.tanggal;
    let nomorPasien = typeof req.body.nomorPasien === 'undefined' ? "" : req.body.nomorPasien;
    let usia = typeof req.body.usia === 'undefined' ? 0 : parseInt(req.body.usia);
    let status = typeof req.body.status === 'undefined' ? "" : req.body.status;

    //Filter id data yang dikirim user
    let errorId = await validator.validInput([id],['id'],[['bilanganBulat','intPositif']],[['Something wrong with request','Something wrong with request']]);

    console.log(errorId);
    if(errorId.length > 0){
        res.status(400).send({
            "message": errorId[0].message
        });

    }else{

        //Variabel temp
        let data = [tanggal, nomorPasien, usia, status];
        let param = ['tanggalForm','nomorPasienForm','usiaForm','statusForm'];
        let rule = [
            ['required','date'],
            ['required','format'],
            ['required','bilanganBulat','intPositif'],
            ['required','inArray']
        ];
        let msg = [
            ['Tanggal tidak boleh kosong','Tanggal tidak valid'],
            ['Nomor pasien tidak boleh kosong','Format nomor pasien yang betul adalah No_[angka]'],
            ['Usia tidak boleh kosong','Usia harus bilangan bulat','Usia tidak boleh negatif'],
            ['Status tidak boleh kosong','Status tidak valid']
        ];

        //Filter data yang dikirim user
        let error = await validator.validInput(data,param,rule,msg);
        console.log(error);

        if(error.length > 0){
            res.status(400).send({
                field: error
            });

        }else{

            //Cek keberadaan data yang ingin diubah user
            let check = await modelPasien.getDataPasien('COUNT(*) AS jumlah', ['id = ?'], [id]);
            if(check[0].jumlah  === 1){

                //Update data berdasarkan id
                let result = await modelPasien.update({
                    nomor_pasien: nomorPasien,
                    usia: usia,
                    tanggal: tanggal,
                    status: status
                }, {
                    id: id
                });
    
                if(result.changedRows === 1 ){
                    res.status(201).json({
                        "success": true,
                        "error": null,
                        "message": `Data pasien berhasil diperbaharui`
                    });
                }else{
                    res.status(400).send({
                        "message": "Tidak ada data yang diperbaharui"
                    });
                }

            }else{
                res.status(400).send({
                    "message": "Data tidak ditemukan"
                });
            }
        }
    }

    next();
}

exports.delete = async (req, res, next) => {
    
    //Get data request
    let id = typeof req.body.id === 'undefined' || req.body.id === "" ? 0 : parseInt(req.body.id);
    
    let data = [id];
    let param = ['id'];
    let rule = [['bilanganBulat','intPositif']];
    let msg = [['Something wrong with request','Something wrong with request']];

    //Filter data yang dikirim user
    let error = await validator.validInput(data,param,rule,msg);
    if(error.length > 0){
        res.status(400).send({
            message: error[0].message
        });
    }else{

        //Cek keberadaan data yang ingin dihapus user
        let pasien = await modelPasien.getDataPasien('nomor_pasien', ['id = ?'], [id]);
        console.log(pasien);
        if(pasien.length  === 1){

            //Hapus data pasien berdasarkan id
            let result = await modelPasien.delete({
                id: id
            });

            if(result.affectedRows === 1 ){
                res.status(200).json({
                    "success": true,
                    "message": `Data pasien ${pasien[0].nomor_pasien} berhasil dihapus`
                });
            }else{
                res.status(400).send({message: "Tidak ada data yang dihapus"});
            }
            
        }else{
            res.status(400).send({message: 'Data tidak ditemukan'});
        }
    }
    next();
}