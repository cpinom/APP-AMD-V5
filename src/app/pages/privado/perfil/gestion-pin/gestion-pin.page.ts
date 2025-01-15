import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonNav } from '@ionic/angular';
import { CodeInputComponent } from 'angular-code-input';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { PerfilService } from 'src/app/core/services/perfil.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-gestion-pin',
  templateUrl: './gestion-pin.page.html',
  styleUrls: ['./gestion-pin.page.scss'],
})
export class GestionPinPage implements OnInit {

  @ViewChild('pin1') pin1 !: CodeInputComponent;
  @ViewChild('pin2') pin2 !: CodeInputComponent;
  pinForm: FormGroup;
  mostrarCargando = true;
  mostrarPIN: boolean | undefined;
  mostrarPin1 = true;
  mostrarPin2 = true;
  usarPIN = false;
  privateToken: string | undefined;

  constructor(private fb: FormBuilder,
    private nav: IonNav,
    private api: PerfilService,
    private snackbar: SnackbarService,
    private alertCtrl: AlertController,
    private auth: AuthService,
    private error: ErrorService) {

    this.auth.getAuth().then(result => {
      this.privateToken = result.private_token;
    });

    this.pinForm = this.fb.group({
      pin1: ['', Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ])],
      pin2: ['', Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ])]
    })

  }
  async ngOnInit() {
    try {
      const response = await this.api.estadoPin();
      const { data } = response;

      if (data.success) {
        this.usarPIN = data.pin.existPin;
        this.mostrarPIN = true;
      } else {
        this.mostrarPIN = false;
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
        return;
      }
    }
    finally {
      this.mostrarCargando = false;
    }

    if (this.mostrarPIN && this.usarPIN) {
      setTimeout(() => {
        this.pin1.focusOnField(0);
      }, 500);
    }

    this.api.marcarVista(VISTAS_DOCENTE.PERFIL_PIN);
  }
  onPinChanged(code: any, index: number) {
    if (index == 0) {
      this.pinForm.get('pin1')?.setValue(code);
    } else if (index == 1) {
      this.pinForm.get('pin2')?.setValue(code);
    }
  }
  onPinCompleted(code: any) {
    this.pin2.focusOnField(0);
  }
  async guardarConfiguracion() {
    try {
      const response = await this.api.deshabilitarPin();
      const { data } = response;

      if (data.success) {
        this.snackbar.showToast('Cambios guardados correctamente', 3000, 'success');
        this.nav.pop()
      } else {
        throw Error()
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
        return;
      }
      this.snackbar.showToast('No pudimos procesar su solicitud. Vuelva a intentar.', 3000, 'danger');
    }
  }
  async guardar() {
    if (this.pinForm.valid) {
      try {
        const params = Object.assign({ private_token: this.privateToken }, this.pinForm.value)
        const response = await this.api.guardarPin(params);
        const { data } = response;

        if (data.success) {
          this.presentSuccess('Cambios guardados correctamente');
          this.nav.pop()
        } else {
          throw Error()
        }
      }
      catch (error: any) {
        if (error && error.status == 401) {
          this.error.handle(error);
          return;
        }
        this.snackbar.showToast('No pudimos procesar su solicitud. Vuelva a intentar.', 3000, 'danger');
      }
    }
  }
  async cancelar() {
    await this.nav.pop()
  }
  async presentSuccess(mensaje: string) {
    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      keyboardClose: false,
      cssClass: 'success-alert',
      message: `<div class="image"><ion-icon src = "./assets/icon/check_circle.svg"></ion-icon></div>${mensaje}`,
      buttons: [
        {
          text: 'Aceptar',
          role: 'ok'
        }
      ]
    });

    await alert.present();
  }

}
