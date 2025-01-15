import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonNav, ModalController } from '@ionic/angular';
import { DispositivoPage } from '../dispositivo/dispositivo.page';
import { AuthService } from 'src/app/core/auth/auth.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { AppGlobal } from 'src/app/app.global';
import * as JsBarcode from 'jsbarcode';
import { DispositivoService } from 'src/app/core/services/dispositivo.service';
import { PerfilService } from 'src/app/core/services/perfil.service';

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
    private snackbar: SnackbarService,
    private global: AppGlobal,
    private api: DispositivoService,
    private perfil: PerfilService) { }

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
            background: '#000',
            lineColor: '#fff'
          });
        }
        else {
          JsBarcode(this.barcode.nativeElement, deviceId, {
            height: 40,
            width: 2.5,
            displayValue: true,
            format: 'CODE128A',
            background: '#f0f0f0',
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
      this.snackbar.showToast('Se debe cerrar sesión para continuar.');
    }
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
