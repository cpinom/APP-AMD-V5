import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonInput, IonNav, ModalController } from '@ionic/angular';
import { AppGlobal } from 'src/app/app.global';
import { DialogService } from 'src/app/core/services/dialog.service';
import { DispositivoService } from 'src/app/core/services/dispositivo.service';
import { FormularioTabletPage } from '../formulario-tablet/formulario-tablet.page';
import { ReemplazarTabletPage } from '../reemplazar-tablet/reemplazar-tablet.page';

@Component({
  selector: 'app-pin',
  templateUrl: './pin.page.html',
  styleUrls: ['./pin.page.scss'],
})
export class PinPage implements OnInit, OnDestroy {

  @ViewChild('pinEl', { static: true }) pinEl!: IonInput;
  pinForm!: FormGroup;
  mostrarCargando = false;
  data: any;
  modoConfig!: number;
  interval!: any;

  constructor(private fb: FormBuilder,
    private global: AppGlobal,
    private api: DispositivoService,
    private dialog: DialogService,
    private nav: IonNav,
    private modal: ModalController) {

    this.pinForm = this.fb.group({
      pin: [, Validators.compose([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6)
      ])]
    });

  }
  async ngOnInit() {
    const isValid = await this.api.dataValid();

    if (isValid) {
      this.data = await this.api.getData();
      this.verificarExpiracion();
    }
    else {
      setTimeout(() => {
        this.pinEl?.setFocus();
      }, 500);
    }
  }
  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
  async validarPin() {
    if (this.pinForm.valid) {
      let params = {
        pin: this.pinForm.get('pin')?.value,
        aptaTuuid: this.global.DeviceId
      };

      this.mostrarCargando = true;

      try {
        const response = await this.api.acceso(params);
        const { data } = response;

        if (data.success) {
          await this.api.setDeviceId(data.data.tablet.aptaNcorr);
          await this.api.setAuth(data.data, 3);
          this.data = data.data;
          this.verificarExpiracion();
        }
        else {
          await this.presentError('Configuración', data.message);
          this.pinForm.get('pin')?.setValue('');
        }
      }
      catch (error) {
        console.log('error: ', error);
        await this.presentError('Configuración', 'El servicio no se encuentra disponible o presenta algunos problemas de cobertura, reintenta en un momento.');
      }
      finally {
        this.mostrarCargando = false;
      }
    }
  }
  onPinInput(ev: any) {
    const value = ev.target!.value;
    const filteredValue = value.replace(/[^0-9]+/g, '');

    this.pinEl && (this.pinEl.value = filteredValue);
    this.pinForm.get('pin')?.setValue(filteredValue, { emitEvent: false });
  }
  resolverEstado(estaCcod: number) {
    if (estaCcod == 1) return 'HABILITADA';
    if (estaCcod == 3) return 'ASIGNADA';
    if (estaCcod == 2 || estaCcod == 5) return 'DESHABILITADA';
    return '';
  }
  verificarExpiracion() {
    this.interval = setInterval(async () => {
      const isValid = await this.api.dataValid();

      if (!isValid) {
        this.data = null;
        this.api.clearData();
        clearInterval(this.interval);
      }
    }, 5000);
  }
  async modoConfigTap() {
    if (this.modoConfig == 0 || this.modoConfig == 1) {
      this.nav.push(FormularioTabletPage, { data: this.data, modoConfig: this.modoConfig });
    }
    else if (this.modoConfig == 2) {
      this.nav.push(ReemplazarTabletPage, { data: this.data });
    }
    // if (this.modoConfig == 0) {
    //   this.tabletForm.get('aptaTuuid')?.setValue(this.data.tablet.aptaTuuid);
    //   this.tabletForm.get('aptaNcorr')?.setValue(this.data.tablet.aptaNcorr);
    //   this.tabletForm.get('sedeTdesc')?.setValue(this.data.sedeTdesc);
    //   this.aptaCtablets?.setValue(this.data.tablet.aptaCtablets);
    //   this.aptaNserie?.setValue(this.data.tablet.aptaNserie);
    //   this.swiper.slideTo(2, 0)
    // }
    // else if (this.modoConfig == 1) {
    //   this.tabletForm.get('aptaTuuid')?.setValue(this.data.tablet.aptaTuuid);
    //   this.tabletForm.get('aptaNcorr')?.setValue(this.data.tablet.aptaNcorr);
    //   this.tabletForm.get('sedeTdesc')?.setValue(this.data.sedeTdesc);
    //   this.swiper.slideTo(2, 0)
    // }
    // else if (this.modoConfig == 2) {
    //   this.swiper.slideTo(3, 0)
    // }
    // this.swiper.disable()
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
  salir() {
    this.data = null;
  }
  async cerrar() {
    await this.modal.dismiss();
  }
  get contadorTablets() {
    if (this.data) {
      return this.data.tablets.filter((t: any) => t.aptaNcorr != this.data.tablet.aptaNcorr).length;
    }
    return 0;
  }

}
