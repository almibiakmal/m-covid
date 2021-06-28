const validateDate = require('validate-date');

exports.validInput = async (data, param, rule, msg) =>{
    return new Promise((resolve, reject)=>{
        let error = [];
        //Looping berdasarkan data
        for(i in data){
            let temp = filterInput(data[i],param[i],rule[i],msg[i]);
            if(!(Object.keys(temp).length === 0 && temp.constructor === Object)){
                error.push(temp);
            }
        }

        resolve(error);
    });
    
}

function filterInput(data = "", param = "", rule = [], message = []){

    let tempStatus = ['', 'Dirawat', 'Sembuh', 'Meninggal'];
    
    //Looping berdasarkan rule
    for(i in rule){
        switch(rule[i]){
            case 'required':
                //Error jika data kosong
                if(data === '') return { 'param': param, 'error': true, 'message': message[i] };
            break;

            case 'inArray':
                //Error jika tidak ada dalam array
                if(!tempStatus.includes(data)) return { 'param': param, 'error': true, 'message': message[i] };
            break;

            case 'bilanganBulat':
                //Error jika usia tidak bilangan bulat
                if(!Number.isInteger(data)) return { 'param': param, 'error': true, 'message': message[i] };
            break;

            case 'intPositif':
                //Error jika usia angka negatif
                if(data < 1) return { 'param': param, 'error': true, 'message': message[i] };
            break;

            case 'date':
                //Error jika tanggal format tanggal tidak valid
                if(!validateDate(data, responseType="boolean")) return {'param': param, 'error': true, 'message': message[i]};
            break;
            case 'format':
                //Error jika nomor pasien tidak sesuai format
                
                /**
                 * ^ --> awal baris
                 * * --> jumlah tak hingga
                 * $ --> akhir baris
                 * 
                 * Example:
                 * NO_01, NO_1, NO_10000        ==> true
                 * NO_10p, NO_oppo, NO_0012P    ==> false
                 */
                let format = /^No_[0-9]*$/;
                if(!format.test(data)) return {'param': param, 'error': true, 'message': message[i]};
            break;
        }
    }
    return {};
}