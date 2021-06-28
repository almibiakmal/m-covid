const modelPasien = require('../../models/pasien');

exports.index = async (req, res, next) => {
    res.render('index', { page: 'pages/dashboard/index.ejs', data: null, url: process.env.URL + process.env.PORT});
    next();
}

exports.getDataGrafik = async (req, res, next) => {
    let result = {
        grafikSatu:{
            label: [],
            data: []
        },
        grafikDua:{
            label: [],
            data: []
        },
        grafikTiga:{
            label: [],
            data: []
        }
    };
    
    //Ambil data pasien untuk info grafis di halaman dashboard
    const grafikSatu = await modelPasien.grafikSatu();
    const kelompokSatu = await modelPasien.getDataPasien('COUNT(*) AS jumlah', ['usia < ?'], [17]);
    const kelompokDua = await modelPasien.getDataPasien('COUNT(*) AS jumlah', ['usia >= ?', 'usia <= ?'], [17, 40]);
    const kelompokTiga = await modelPasien.getDataPasien('COUNT(*) AS jumlah', ['usia >= ?'], [40]);
    const grafikTiga = await modelPasien.grafikTiga();


    //result data untuk grafik satu
    let labelGrafikSatu = [];
    let dataGrafikSatu = [];
    grafikSatu.forEach((val)=>{
        labelGrafikSatu.push(val.tanggal);
        dataGrafikSatu.push(val.jumlah);
    });
    result.grafikSatu.deskripsi = "Data jumlah pasien positif covid perhari";
    result.grafikSatu.label = labelGrafikSatu;
    result.grafikSatu.data = dataGrafikSatu;
    // end result data untuk grafik satu

    //result data untuk grafik dua
    result.grafikDua.deskripsi = "Data jumlah pasien positif covid berdasarkan status";
    result.grafikDua.label = ["< 17","17 - 40","40 >"];
    result.grafikDua.data = [kelompokSatu[0].jumlah, kelompokDua[0].jumlah, kelompokTiga[0].jumlah];
    //end result data untuk grafik dua

    //result data untuk grafik tiga
    let labelGrafikTiga = [];
    let dataGrafikTiga = [];
    grafikTiga.forEach((val)=>{
        labelGrafikTiga.push(val.status);
        dataGrafikTiga.push(val.jumlah);
    });
    result.grafikTiga.deskripsi = "Data jumlah pasien positif covid berdasarkan status";
    result.grafikTiga.label = labelGrafikTiga;
    result.grafikTiga.data = dataGrafikTiga;
    // end result data untuk grafik tiga

    res.json({
        data: result
    });

    next();
}