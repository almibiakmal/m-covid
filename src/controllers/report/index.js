const modelPasien = require('../../models/pasien');

exports.index = async (req, res, next) => {
    let data = await modelPasien.jumlahPasienPositifPerhari();
    let status = ['Dirawat', 'Sembuh', 'Meninggal'];
    
    for(let i in data){
        console.log(data[i].tanggal);
        
        for(let j in status){
            let temp = await modelPasien.jumlahPasienPerstatus({
                "tanggal": data[i].tanggal,
                "status": status[j]
            });

            switch(status[j]){
                case "Dirawat":
                    data[i].Dirawat = temp[0].jumlah;
                break;
                case "Sembuh":
                    data[i].Sembuh = temp[0].jumlah;
                break;
                case "Meninggal":
                    data[i].Meninggal = temp[0].jumlah;
                break;
            }
        }
    }

    res.render('index', {
        page: 'pages/report/index.ejs',
        data: data,
        url: process.env.URL + process.env.PORT
    });

    next();
}