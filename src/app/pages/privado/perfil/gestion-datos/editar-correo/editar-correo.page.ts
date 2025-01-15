import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonNav, LoadingController, Platform } from '@ionic/angular';
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
  selector: 'app-editar-correo',
  templateUrl: './editar-correo.page.html',
  styleUrls: ['./editar-correo.page.scss'],
})
export class EditarCorreoPage implements OnInit {

  @ViewChild('codeInput') codeInput !: CodeInputComponent;
  form: FormGroup;
  perfil: any;
  mostrarCodigo = false;
  submitted = false;

  constructor(private fb: FormBuilder,
    private api: PerfilService,
    private auth: AuthService,
    private alertCtrl: AlertController,
    private loading: LoadingController,
    private snackbar: SnackbarService,
    private error: ErrorService,
    private nav: IonNav,
    private events: EventsService,
    private pt: Platform) {

    this.form = this.fb.group({
      persTemail: ['', Validators.compose([Validators.required, Validators.email])],
      persTemailConfirma: ['', Validators.compose([Validators.required, Validators.email])],
      accoTpin: ['']
    });

    if (this.pt.is('mobileweb')) {
      this.correo?.setValue('vandit.va@gmail.com');
      this.correoConfirma?.setValue('vandit.va@gmail.com');
    }

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

    if (this.form.valid && this.correosIguales) {
      const loading = await this.loading.create({ message: 'Cargando...' });
      const params = {
        persTemail: this.correo?.value,
        persTemailConfirma: this.correoConfirma?.value
      };

      await loading.present();

      try {
        const response = await this.api.confirmarCorreo(params);
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
      const params = { accoTpin: this.accoTpin?.value, accoTmovimiento: Movimientos.CORREO };

      await loading.present();

      try {
        const response = await this.api.confirmarPin(params);
        const { data } = response;

        if (data.success) {
          this.perfil.user = data.user;
          this.auth.setAuth(this.perfil);
          this.events.onEmailUpdate.next(data.user);

          loading.dismiss();
          this.presentSuccess(() => {
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
    let mensaje = 'Su correo fue confirmado exitosamente.'
    let alert = await this.alertCtrl.create({
      keyboardClose: false,
      backdropDismiss: false,
      header: 'Confirmar correo',
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
  get correo() { return this.form.get('persTemail') }
  get correoConfirma() { return this.form.get('persTemailConfirma') }
  get accoTpin() { return this.form.get('accoTpin') }
  get correosIguales() {
    if (this.correo?.valid && this.correoConfirma?.valid) {
      if (this.correo.value == this.correoConfirma.value) {
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

