import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Haptics } from '@capacitor/haptics';
import { IonInput, ModalController } from '@ionic/angular';
import { DialogService } from 'src/app/core/services/dialog.service';
import { DispositivoService } from 'src/app/core/services/dispositivo.service';

@Component({
  selector: 'app-formulario-tablet',
  templateUrl: './formulario-tablet.page.html',
  styleUrls: ['./formulario-tablet.page.scss'],
})
export class FormularioTabletPage implements OnInit {

  @ViewChild('codigoEl', { static: true }) codigoEl!: IonInput;
  @ViewChild('serieEl', { static: true }) serieEl!: IonInput;
  data: any;
  modoConfig: any;
  tabletForm!: FormGroup;
  mostrarCargando = false;

  constructor(private fb: FormBuilder,
    private dialog: DialogService,
    private api: DispositivoService,
    private modal: ModalController) {

    this.tabletForm = this.fb.group({
      aptaTuuid: [],
      aptaNcorr: [],
      sedeTdesc: [],
      aptaCtablets: [, Validators.compose([
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10)
      ])],
      aptaNserie: [, Validators.compose([
        Validators.required,
        Validators.maxLength(40)
      ])]
    });

  }
  ngOnInit() {
    if (this.modoConfig == 0) {
      this.tabletForm.get('aptaTuuid')?.setValue(this.data.tablet.aptaTuuid);
      this.tabletForm.get('aptaNcorr')?.setValue(this.data.tablet.aptaNcorr);
      this.tabletForm.get('sedeTdesc')?.setValue(this.data.sedeTdesc);
      this.aptaCtablets?.setValue(this.data.tablet.aptaCtablets);
      this.aptaNserie?.setValue(this.data.tablet.aptaNserie);
    }
    else if (this.modoConfig == 1) {
      this.tabletForm.get('aptaTuuid')?.setValue(this.data.tablet.aptaTuuid);
      this.tabletForm.get('aptaNcorr')?.setValue(this.data.tablet.aptaNcorr);
      this.tabletForm.get('sedeTdesc')?.setValue(this.data.sedeTdesc);
    }

  }
  async guardarTablet() {
    if (this.tabletForm.valid) {
      const loading = await this.dialog.showLoading({ message: 'Procesando...' });

      try {
        const params = Object.assign({ amseTpin: this.data.amseTpin, sedeCcod: this.data.sedeCcod }, this.tabletForm.value);
        const response = await this.api.actualizarTablet(params);
        const { data } = response;

        if (data.success) {
          await loading.dismiss();

          if (data.code == 1) {
            await this.presentSuccess('Configuración', `Tablet "${this.aptaCtablets?.value}" registrada correctamente.`);
            await this.modal.dismiss();
            await this.api.clearData();
          }
          else if (data.code == 2) {
            await this.presentError('Configuración', `Ya existe un Código Tablet "${this.aptaCtablets?.value}". Intente con otro.`);
            await Haptics.vibrate();
            this.aptaCtablets?.setValue('');
          }
          else if (data.code == 3) {
            await this.presentSuccess('Configuración', 'Tablet migrada correctamente.');
            await this.modal.dismiss();
            await this.api.clearData();
          }
          else if (data.code == 4) {
            await this.presentError('Configuración', 'El nuevo ID APP ingresado no corresponde a un código valido.');
            await Haptics.vibrate();
          }
        }
        else {
          await this.presentError('Configuración', data.message);
          await Haptics.vibrate();
        }
      }
      catch (error: any) {
        await this.presentError('Configuración', 'Ha ocurrido un error inesperado. Vuelva a intentar.');
      }
      finally {
        await loading.dismiss();
      }

    }
    else {
      this.tabletForm.markAllAsTouched();
    }
  }
  onCodigoInput(ev: any) {
    const value = ev.target!.value;
    const filteredValue = value.replace(/[^a-zA-Z0-9_-]+/g, '').toUpperCase();

    this.codigoEl.value = filteredValue;
    this.aptaCtablets?.setValue(filteredValue, { emitEvent: false });
  }
  onSerieInput(ev: any) {
    const value = ev.target!.value;
    const filteredValue = value.replace(/[^a-zA-Z0-9]+/g, '').toUpperCase();

    this.serieEl.value = filteredValue;
    this.aptaNserie?.setValue(filteredValue, { emitEvent: false });
  }
  async presentSuccess(title: string, message: string) {
    const alert = await this.dialog.showAlert({
      backdropDismiss: false,
      keyboardClose: false,
      cssClass: 'success-alert',
      header: title,
      message: `<div class="image"><ion-icon src = "./assets/icon/check_circle.svg"></ion-icon></div>${message}`,
      buttons: [
        {
          text: 'Aceptar',
          role: 'ok'
        }
      ]
    });

    return alert;
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
  get codigoError() {
    if (this.aptaCtablets?.hasError('required')) return 'Campo es obligatorio.';
    if (this.aptaCtablets?.hasError('minlength')) return 'Mínimo de 10 caracteres.';
    if (this.aptaCtablets?.hasError('maxlength')) return 'Máximo de 10 caracteres permitidos.';
    if (this.aptaCtablets?.hasError('espaciosBlancos')) return 'El campo no puede contener espacios en blanco.';
    return '';
  }
  get serieError() {
    if (this.aptaNserie?.hasError('required')) return 'Campo es obligatorio.';
    if (this.aptaNserie?.hasError('maxlength')) return 'Máximo de 40 caracteres permitidos.';
    return '';
  }
  get aptaCtablets() { return this.tabletForm.get('aptaCtablets'); }
  get aptaNserie() { return this.tabletForm.get('aptaNserie'); }

}
