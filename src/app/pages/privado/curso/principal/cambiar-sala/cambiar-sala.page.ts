import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { BarcodeScanResult, BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-cambiar-sala',
  templateUrl: './cambiar-sala.page.html',
  styleUrls: ['./cambiar-sala.page.scss'],
})
export class CambiarSalaPage implements OnInit {

  salas: any;
  libro!: number;
  movimientos: any;
  estadoClase: any;
  // coordinadas: any;
  form!: FormGroup;
  ordinales: any = ["Inicio Clase", "Primer cambio", "Segundo cambio", "Tercer cambio", "Cuarto cambio", "Quinto cambio", "Sexto cambio", "Séptimo cambio", "Octavo cambio", "Noveno cambio", "Décimo cambio"];

  constructor(private modalCtrl: ModalController,
    private api: CursoService,
    private pt: Platform,
    private fb: FormBuilder,
    private loading: LoadingController,
    private error: ErrorService,
    private alertCtrl: AlertController,
    // private barcodeScanner: BarcodeScanner,
    private snackbar: SnackbarService) {

    this.form = this.fb.group({
      sala: ['', Validators.required]
    });

  }
  async ngOnInit() {
    // let permission = await Geolocation.checkPermissions();
    // let coordinates: any;

    // if (permission.location == 'denied' || permission.location == 'prompt') {
    //   if (this.pt.is('capacitor')) {
    //     permission = await Geolocation.requestPermissions();
    //   }
    // }

    // try {
    //   coordinates = await Geolocation.getCurrentPosition();
    // }
    // catch { }

    // this.coordinadas = coordinates;
  }
  async encanearTap() {
    let permission = await Camera.checkPermissions();

    if (permission.camera == 'denied' || permission.camera == 'prompt') {
      if (this.pt.is('capacitor')) {
        permission = await Camera.requestPermissions();
      }
    }
    if (permission.camera == 'granted') {
      // const scanResult: BarcodeScanResult = await this.barcodeScanner.scan();

      // if (!scanResult.cancelled) {
      //   if (scanResult.format != 'QR_CODE') {
      //     this.snackbar.showToast('Debe posicionar la cámara en frente de un código tipo QR.');
      //     return;
      //   }

      //   const salaCcod = Number(scanResult.text);
      //   const existeSala = this.salas.filter((t: any) => t.salaCcod == salaCcod).length > 0;

      //   if (existeSala) {
      //     this.sala?.setValue(salaCcod);
      //   }
      //   else {
      //     this.snackbar.showToast('El código QR escaneado no existe en el listado de salas disponibles. Intente seleccionando la sala.');
      //   }
      // }
    }
    else {
      this.snackbar.showToast('Se deben verificar los permisos de la la Cámara.');
    }
  }
  async enviar() {
    if (this.form.valid) {
      const loading = await this.loading.create({ message: 'Procesando...' });

      await loading.present();

      try {
        // const params = {
        //   lclaNcorr: this.libro,
        //   salaCcod: this.sala?.value,
        //   lcmoNlatitud: this.coordinadas ? this.coordinadas.coords.latitude : null,
        //   lcmoNlongitud: this.coordinadas ? this.coordinadas.coords.longitude : null
        // };
        const params = {
          lclaNcorr: this.libro,
          salaCcod: this.sala?.value,
          lcmoNlatitud: null,
          lcmoNlongitud: null
        };
        const response = await this.api.cambiarSalaClase(params);
        const { data } = response;

        loading.dismiss();

        if (data.success) {
          this.presentSuccess('El cambio de sala se comunicó correctamente.');
          this.modalCtrl.dismiss(data.estado);
          this.api.marcarVista(VISTAS_DOCENTE.CURSO_CAMBIA_SALA);
        }
        else {
          throw Error();
        }
      }
      catch (error: any) {
        if (error && error.status == 401) {
          this.error.handle(error);
          return;
        }

        this.snackbar.showToast('No pudimos procesar su solicitud. Vuelva a intentar.', 3000, 'danger');
      }
      finally {
        loading.dismiss();
      }
    }
  }
  presentSuccess(mensaje: string) {
    this.alertCtrl.create({
      backdropDismiss: false,
      keyboardClose: false,
      cssClass: 'success-alert',
      header: 'Comunicar Cambio de Sala',
      message: `<div class="image"><ion-icon src = "./assets/icon/check_circle.svg"></ion-icon></div>${mensaje}`,
      buttons: [
        {
          text: 'Aceptar',
          role: 'ok'
        }
      ]
    }).then(alert => alert.present())
  }
  async cerrar() {
    await this.modalCtrl.dismiss();
  }
  get sala() { return this.form.get('sala'); }

}
