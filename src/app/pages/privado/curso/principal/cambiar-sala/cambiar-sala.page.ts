import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Platform } from '@ionic/angular';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { BarcodeScanningModalComponent } from 'src/app/core/components/barcode-scanning-modal/barcode-scanning-modal.component';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { DialogService } from 'src/app/core/services/dialog.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { UtilsService } from 'src/app/core/services/utils.service';

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

  constructor(private api: CursoService,
    private pt: Platform,
    private fb: FormBuilder,
    private dialog: DialogService,
    private error: ErrorService,
    private snackbar: SnackbarService,
    private utils: UtilsService) {

    this.form = this.fb.group({
      sala: ['', Validators.required]
    });

  }
  ngOnInit() { }
  async encanearTap() {
    let mostrarEscaneo = true;

    if (this.pt.is('capacitor')) {
      let permission = await Camera.checkPermissions();

      if (permission.camera == 'denied' || permission.camera == 'prompt') {
        if (this.pt.is('capacitor')) {
          permission = await Camera.requestPermissions();
        }
      }
      if (permission.camera == 'granted') {
        mostrarEscaneo = true;
      }
      else {
        mostrarEscaneo = false;
        await this.utils.showAlertCamera();
      }
    }

    if (mostrarEscaneo) {
      const barcode = await this.escanearQR();

      if (barcode) {
        // if (barcode.format == BarcodeFormat.QrCode) {
        const regex = /^\d{1,4}$/;
        const validString = regex.test(barcode);

        if (validString) {
          const salaCcod = Number(barcode);
          const existeSala = this.salas.filter((t: any) => t.salaCcod == salaCcod).length > 0;

          if (existeSala) {
            this.sala?.setValue(salaCcod);
          }
          else {
            await this.snackbar.showToast('El código QR escaneado no existe en el listado de salas disponibles. Intente seleccionando la sala.', 3000, 'danger');
          }

        }
        else {
          await this.snackbar.showToast('El código QR no es válido. Vuelva a intentar.', 3000, 'danger');
        }
        // }
        // else {
        //   await this.snackbar.showToast('Debe posicionar la cámara en frente de un código tipo QR.');
        // }
      }
    }
  }
  async escanearQR() {
    document.querySelector('body')?.classList.add('barcode-scanning-active');

    // return new Promise<string | undefined>(async resolve => {
    //   await BarcodeScanner.hideBackground();

    //   const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] });

    //   document.querySelector('body')?.classList.remove('barcode-scanning-active');

    //   if (result.hasContent) {
    //     console.log(result.content);
    //     resolve(result.content)
    //   }
    //   else {
    //     resolve(undefined)
    //   }
    // });
    return new Promise<string | undefined>(async resolve => {
      const element = await this.dialog.showModal({
        component: BarcodeScanningModalComponent,
        cssClass: 'barcode-scanning-modal',
        showBackdrop: false,
        animated: false
      });

      element.onDidDismiss().then((result) => {
        debugger
        const barcode: string | undefined = result.data?.barcode;

        if (barcode) {
          resolve(barcode)
        }
        else {
          resolve(undefined)
        }
      })
    });
  }
  async enviar() {
    if (this.form.valid) {
      const confirm = await this.showConfirmation('¿Está seguro de comunicar el cambio de sala de clase?');

      if (!confirm) {
        return;
      }

      const loading = await this.dialog.showLoading({ message: 'Procesando...' });

      try {
        const params = {
          lclaNcorr: this.libro,
          salaCcod: this.sala?.value,
          lcmoNlatitud: null,
          lcmoNlongitud: null
        };
        const response = await this.api.cambiarSalaClase(params);
        const { data } = response;

        await loading.dismiss();

        if (data.success) {
          await this.dialog.dismissModal(data.estado);
          await this.presentSuccess('El cambio de sala se comunicó correctamente.');
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

        await this.snackbar.showToast('No pudimos procesar su solicitud. Vuelva a intentar.', 3000, 'danger');
      }
      finally {
        await loading.dismiss();
      }
    }
  }
  async presentSuccess(mensaje: string) {
    const alert = await this.dialog.showAlert({
      backdropDismiss: false,
      keyboardClose: false,
      cssClass: 'success-alert',
      header: 'Comunicar Cambio de Sala',
      message: `<div class="image"><ion-icon src = "./assets/icon/check_circle.svg"></ion-icon></div>${mensaje}`,
      buttons: ['Aceptar']
    });

    return alert;
  }
  async showConfirmation(message: string, header: string = 'Comunicar Cambio de Sala'): Promise<boolean> {
    return new Promise(async (resolve) => {
      await this.dialog.showAlert({
        header: header,
        message: message,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Continuar',
            role: 'destructive',
            handler: () => resolve(true)
          }
        ]
      });
    });
  }

  async cerrar() {
    await this.dialog.dismissModal();
  }
  get sala() { return this.form.get('sala'); }

}
