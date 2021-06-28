var tombolCari = document.getElementById('cariData');

/**
 * Function untuk menutup form tambah dan edit data pasien
 */
var closeForm = () => {
    $('#formModal').modal('hide');
}

  /**
   * Function untuk membuka form tambah dan edit data pasien
  */
  var showForm = (title = "Tambah Data", data = []) => {
    formModalLabel.innerText = title;

    if(data.length == 1){
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = "idForm";
      input.id = "idForm";

      document.getElementById('container').appendChild(input);
      document.getElementById('idForm').value = data[0].id;
      document.getElementById('tanggalForm').value = data[0].tanggal;
      document.getElementById('nomorPasienForm').value = data[0].nomorPasien;
      document.getElementById('usiaForm').value = data[0].usia;
      document.getElementById('statusForm').value = data[0].status;
      document.getElementById("simpanData").setAttribute("onClick","updateData()");

    }else{

      let idForm = document.getElementById('idForm');
      if(idForm != null){
        document.getElementById('container').removeChild(idForm);
      }
      
      document.getElementById('tanggalForm').value = "";
      document.getElementById('nomorPasienForm').value = "";
      document.getElementById('usiaForm').value = "";
      document.getElementById('statusForm').value = "";

      document.getElementById("simpanData").setAttribute("onClick","simpanData()");
    }

    $('#formModal').modal('show');
  }

  /**
   * Function untuk mendapatkan nilai form input untuk proses tambah dan edit
  */
  var getFormValue = (type = "simpan") => {
    var data = {};

    data.tanggal = document.getElementById('tanggalForm').value;
    data.nomorPasien = document.getElementById('nomorPasienForm').value;
    data.usia = document.getElementById('usiaForm').value;
    data.status = document.getElementById('statusForm').value;

    if(type != 'simpan'){
      data.id = document.getElementById('idForm').value;
    }

    return data;
  }

  //Mengembalikan form ke keadaan awal (tanpa ada pesan error)
  var defaultForm = () => {
    let fieldValidation = ['tanggalForm','nomorPasienForm','usiaForm','statusForm'];
    
    fieldValidation.forEach( (vi) => {
        document.getElementById(vi).setAttribute('class', 'form-control');
        document.getElementById(`valid-${vi}`).innerHTML = "";
    });
  }

  //Memberikan error setiap form
  var showErrorForm = (error) => {
    defaultForm();

    error.forEach( (vr) => {
      document.getElementById(`valid-${vr.param}`).innerText = vr.message;
      document.getElementById(vr.param).classList.add("is-invalid");
    });

  }

  /**
   * Function untuk menyimpan data pasien baru
  */
  var simpanData = () => {
    let data = getFormValue();

    axios.post("http://localhost:3000/pasien/create", data)
    .then((result) => {

      swal(result.data.message, {
        icon: "success",
      }).then((res) => {
        document.location.reload();
      });
      
    }).catch((err) => {
      
      if(err.response.data.message != undefined){
        swal(err.response.data.message);
      }else{
        showErrorForm(err.response.data.field);
      }
    });
  }

  /**
   * Function untuk update data pasien
  */
  var updateData = () => {
    let data = getFormValue('ubah');

    console.log(data);
    
    axios.put("http://localhost:3000/pasien/update", data)
    .then((result) => {

      console.log(result);
      swal(result.data.message, {
        icon: "success",
      }).then((res) => {
        document.location.reload();
      });
      
    }).catch((err) => {
      console.log(err.response);
      if(err.response.data.message != undefined){
        swal(err.response.data.message);
      }else{
        showErrorForm(err.response.data.field);
      }

      // swal(err.response.data.message);
    });
  }
  
  /**
   * Function untuk mendapatkan detail data berdasarkan id
  */
  var getDetail = (param) => {
    let id = param.getAttribute("kd");

    if(id != ""){

      axios.post("http://localhost:3000/pasien/detail", {id: id})
      .then((result) => {
        let temp = result.data.data;
        console.log(temp);
        showForm('Edit Data', temp);
        
      }).catch((err) => {
        console.log(err);
        // swal(err.response.data.message);
      });
    }
  }

  /**
   *Funtion untuk menghapus data pasien
   */
  var remove = (param) => {
    let id = param.getAttribute("kd");

    if(id != ""){
      swal({
        title: "Hapus Data",
        text: "Apakah anda yakin akan menghapus data ini?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((res) => {

        if (res) {
          axios.delete("http://localhost:3000/pasien/delete", { data: {id: id}})
          .then((result) => {

            if(result.status === 200 ){
              // console.log(result.data);
              swal(result.data.message, {
                icon: "success",
              }).then((res) => {
                document.location.reload();
              });

            }else{
              swal(result.data.message);
            }
            
          }).catch((err) => {
            swal(err.response.data.message);
          });
        }
      });
    }
  }