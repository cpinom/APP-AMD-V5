import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EvaluacionesService } from 'src/app/core/services/curso/evaluaciones.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-autenticacion',
  templateUrl: './autenticacion.page.html',
  styleUrls: ['./autenticacion.page.scss'],
})
export class AutenticacionPage implements OnInit {

  mostrarCargando = true;
  mostrarPin = false;
  mostrarClave = false;
  deshabilitarContinuar = true;
  clave: string | undefined;

  constructor(private modalCtrl: ModalController,
    private api: EvaluacionesService,
    private error: ErrorService,
    private snackbar: SnackbarService) { }

  async ngOnInit() {
    try {
      const token = await this.api.getStorage('token');
      const response = await this.api.getAutenticacion({ token: token });
      const { data } = response;

      if (data.success) {
        if (data.tokenValid === true) {
          setTimeout(() => {
            this.modalCtrl.dismiss(token);
          }, 250);
          return;
        }
        else {
          this.mostrarClave = data.startWinPin === false;
          this.mostrarPin = data.startWinPin === true;
          this.mostrarCargando = false;

          if (token) {
            // this.api.clearStorage()
          }
        }
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
      }
      this.modalCtrl.dismiss();
    }
    finally {
      // this.mostrarCargando = false;
    }
  }
  onPinChanged(code: string) {
    this.deshabilitarContinuar = code.length < 6;
  }
  onPinCompleted(code?: string) {
    this.deshabilitarContinuar = false;
    this.clave = code;
  }
  onClaveInput(ev: any) {
    const value = ev.target!.value;
    this.deshabilitarContinuar = value.length == 0;
  }
  async continuar() {
    this.mostrarCargando = true;

    try {
      const params = {
        clave: this.clave,
        pin: this.mostrarPin
      };

      const response = await this.api.validarUsuario(params);
      const { data } = response;

      if (data.success) {
        this.api.setStorage('token', data.token);
        this.modalCtrl.dismiss(data.token);
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
      this.mostrarCargando = false;
    }
  }

}
