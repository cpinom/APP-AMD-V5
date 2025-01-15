import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonNav, LoadingController } from '@ionic/angular';
import { CodeInputComponent } from 'angular-code-input';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { EventsService } from 'src/app/core/services/events.services';
import { PerfilService } from 'src/app/core/services/perfil.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

enum Movimientos {
  CORREO = 1,
  TELEFONO = 2
};

@Component({
  selector: 'app-editar-telefono',
  templateUrl: './editar-telefono.page.html',
  styleUrls: ['./editar-telefono.page.scss'],
})
export class EditarTelefonoPage implements OnInit {

  @ViewChild('codeInput') codeInput !: CodeInputComponent;
  form: FormGroup;
  perfil: any;
  submitted!: boolean;
  mostrarCodigo = false;

  constructor(private fb: FormBuilder,
    private api: PerfilService,
    private nav: IonNav,
    private snackbar: SnackbarService,
    private loading: LoadingController,
    private error: ErrorService,
    private alertCtrl: AlertController,
    private events: EventsService,
    private auth: AuthService) {

    this.form = this.fb.group({
      persTcelular: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^(\+?56){0,1}(9)[98765]\d{7}$/)
      ])],
      persTcelularConfirma: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^(\+?56){0,1}(9)[98765]\d{7}$/)
      ])],
      accoTpin: ['']
    })

  }
  async ngOnInit() {
    this.auth.getAuth().then(result => {
      this.perfil = result
    });
  }
  async cancelar() {
    this.mostrarCodigo = false;
    this.accoTpin?.clearValidators();
    this.accoTpin?.updateValueAndValidity();
  }
  async validar() {
    this.submitted = true;

    if (this.form.valid && this.telefonosIguales) {
      const loading = await this.loading.create({ message: 'Cargando...' });
      const params = {
        persTcelular: this.celular?.value,
        persTcelularConfirma: this.celularConfirma?.value
      };

      await loading.present();

      try {
        const response = await this.api.confirmarTelefono(params);
        const { data } = response;

        if (data.success) {
          this.mostrarCodigo = true;
          this.accoTpin?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
          this.accoTpin?.updateValueAndValidity();

          setTimeout(() => {
            this.codeInput.focusOnField(0);
          }, 500);
        } else {
          this.snackbar.showToast(data.message);
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
        await loading.dismiss();
      }
    }
  }
  async confirmar() {
    if (this.codigoValido) {
      const loading = await this.loading.create({ message: 'Validando...' });
      const params = { accoTpin: this.accoTpin?.value, accoTmovimiento: Movimientos.TELEFONO };

      await loading.present();

      try {
        const response = await this.api.confirmarPin(params);
        const { data } = response;

        if (data.success) {
          this.perfil.user = data.user;
          this.auth.setAuth(this.perfil);
          this.events.onPhoneUpdate.next(data.user);

          loading.dismiss();

          await this.presentSuccess(() => {
            this.nav.pop();
          });
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
        await loading.dismiss();
      }
    }
  }
  onPinChanged(code: string) {
    this.accoTpin?.setValue(code);
  }
  onPinCompleted(code: string) { }
  async presentSuccess(callback: Function) {
    let mensaje = 'Tu teléfono ha sido actualizado correctamente.'
    let alert = await this.alertCtrl.create({
      keyboardClose: false,
      backdropDismiss: false,
      header: 'Actualizar Teléfono',
      cssClass: 'success-alert',
      message: `<div class="image"><ion-icon src = "./assets/icon/check_circle.svg"></ion-icon></div>${mensaje}`,
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            callback();
          }
        }
      ]
    });

    await alert.present();
  }
  get celular() { return this.form.get('persTcelular') }
  get celularConfirma() { return this.form.get('persTcelularConfirma') }
  get accoTpin() { return this.form.get('accoTpin') }
  get telefonosIguales() {
    if (this.celular?.valid && this.celularConfirma?.valid) {
      if (this.celular.value == this.celularConfirma.value) {
        return true;
      }
      return false;
    }

    return true;
  }
  get codigoValido() {
    return this.accoTpin?.valid;
  }

}
