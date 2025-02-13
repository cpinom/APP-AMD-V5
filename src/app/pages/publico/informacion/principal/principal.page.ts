import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonNav, ModalController } from '@ionic/angular';
import { DispositivoPage } from '../dispositivo/dispositivo.page';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AppGlobal } from 'src/app/app.global';
import * as JsBarcode from 'jsbarcode';
import { DispositivoService } from 'src/app/core/services/dispositivo.service';
import { PerfilService } from 'src/app/core/services/perfil.service';
import { DialogService } from 'src/app/core/services/dialog.service';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
})
export class PrincipalPage implements OnInit {

  @ViewChild('barcode') barcode!: ElementRef;
  mostrarBarcode = false;

  constructor(private modal: ModalController,
    private nav: IonNav,
    private auth: AuthService,
    private global: AppGlobal,
    private api: DispositivoService,
    private perfil: PerfilService,
    private dialog: DialogService) { }

  ngOnInit() {
  }
  async ionViewDidEnter() {
    const deviceId = await this.api.getDeviceId();

    if (deviceId) {
      this.mostrarBarcode = true;

      setTimeout(() => {

        if (this.perfil.isDarkMode()) {
          JsBarcode(this.barcode.nativeElement, deviceId, {
            height: 40,
            width: 2.5,
            displayValue: true,
            format: 'CODE128A',
            background: '#000000',
            lineColor: '#ffffff'
          });
        }
        else {
          JsBarcode(this.barcode.nativeElement, deviceId, {
            height: 40,
            width: 2.5,
            displayValue: true,
            format: 'CODE128A',
            background: '#fafafa',
            lineColor: '#000'
          });
        }
      }, 50)
    }
  }
  async configuracion() {
    const isValid = await this.auth.tokenValid();

    if (!isValid) {
      await this.nav.push(DispositivoPage);
    }
    else {
      await this.presentError('Configuración Dispositivo', 'Se debe cerrar sesión para continuar.');
    }
  }
  async presentError(title: string, message: string) {
    const alert = await this.dialog.showAlert({
      cssClass: 'alert-message',
      message: `<img src="./assets/images/warning.svg" /><br />${message}`,
      header: title,
      buttons: ['Aceptar']
    });

    return alert;
  }
  async cerrar() {
    await this.modal.dismiss();
  }
  get version() {
    return this.global.Version;
  }
  get environment() {
    return this.global.Environment;
  }

}
