import { Injectable } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { MensajeComponent } from './mensaje.component';
import { InacapmailService } from '../../services/inacapmail.service';
import { SnackbarService } from '../../services/snackbar.service';
import { ErrorService } from '../../services/error.service';

@Injectable({
  providedIn: 'root'
})
export class MensajeService {

  emailRegexp = new RegExp('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}');

  constructor(private modalCtrl: ModalController,
    private api: InacapmailService,
    private snackbar: SnackbarService,
    private error: ErrorService,
    private pt: Platform) { }

  async crear(correo = '', asunto = '') {
    correo = correo || '';
    asunto = asunto || '';

    if (correo) {
      let isValid = this.emailRegexp.test(correo);

      if (!isValid) {
        return Promise.reject(`El correo "${correo}" es inválido.`);
      }
    }

    const snackbar = await this.snackbar.create('Creando mensaje...', false, 'medium');
    snackbar.present();

    if (correo && this.pt.is('mobileweb')) {
      correo = 'cpinom@inacap.cl';
    }

    try {
      const params = {
        destinatarios: correo,
        asunto: asunto,
        cuerpo: '\n\n\n\n\n\n\n\n\nEnviado desde Ambiente Móvil Docente AMD'
      };
      const response = await this.api.createMessage(params);
      const { data } = response;

      snackbar.dismiss();

      if (data.success) {
        const modal = await this.modalCtrl.create({
          component: MensajeComponent,
          componentProps: {
            messageId: data.id,
            correo: correo
          },
          // presentingElement: getRouterOutlet()!,
          canDismiss: async (data?: any, role?: string) => {
            if (role == 'gesture' || role == 'backdrop') {
              return false;
            }
            return true
          }
        });

        modal.onDidDismiss().then(result => {
          if (result.role == 'cancel') {
            this.api.deleteMessage(result.data).catch((error) => {
              console.log(error)
            })
          }
        })

        await modal.present();

        return Promise.resolve();
      }
      else {
        throw Error();
      }

    }
    catch (error: any) {
      snackbar.dismiss();

      if (error && error.status == 401) {
        this.error.handle(error);
        return;
      }
      return Promise.reject('Error creando mensaje.');
    }
  }
  async responder(id: string, mensaje: any) {
    const params = {
      messageId: id,
      asunto: '',
      cuerpo: '\n\n\n\n\n\n\n\n\nEnviado desde Ambiente Móvil Docente AMD'
    };

    const snackbar = await this.snackbar.create('Creando respuesta...', false, 'medium');

    snackbar.present();

    try {
      const response = await this.api.createReply(params);
      const { data } = response;

      snackbar.dismiss();

      if (!data.success) {
        return Promise.reject(data.message);
      }

      const modal = await this.modalCtrl.create({
        component: MensajeComponent,
        componentProps: {
          messageId: data.id,
          message: mensaje,
          isReply: true
        },
        // presentingElement: getRouterOutlet()!,
        canDismiss: async (data?: any, role?: string) => {
          if (role == 'gesture' || role == 'backdrop') {
            return false;
          }
          return true
        }
      });

      await modal.present();

      return Promise.resolve();
    }
    catch (error: any) {
      snackbar.dismiss();

      if (error && error.status == 401) {
        this.error.handle(error);
        return;
      }
      return Promise.reject('Error creando mensaje.');
    }
  }
}

export function getRouterOutlet() {
  return document.getElementById('ion-router-outlet-content');
}