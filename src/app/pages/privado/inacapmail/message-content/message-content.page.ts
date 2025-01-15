import { Component, OnInit } from '@angular/core';
import { IonNav } from '@ionic/angular';
import * as moment from 'moment';
import { MensajeService } from 'src/app/core/components/mensaje/mensaje.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { EventsService } from 'src/app/core/services/events.services';
import { InacapmailService } from 'src/app/core/services/inacapmail.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-message-content',
  templateUrl: './message-content.page.html',
  styleUrls: ['./message-content.page.scss'],
})
export class MessageContentPage implements OnInit {

  mostrarCargando = true;
  mostrarData = false;
  data: any;
  message: any;
  messages: any;
  deshabilitaEliminar = false;

  constructor(private nav: IonNav,
    private api: InacapmailService,
    private events: EventsService,
    private error: ErrorService,
    private snackbar: SnackbarService,
    private utils: UtilsService,
    private mensaje: MensajeService) {
    moment.locale('es');
  }
  async ngOnInit() {
    await this.cargar();
  }
  async cargar() {
    try {
      const response = await this.api.getMessage(this.message.id);
      const { data } = response;

      if (data.success) {
        this.data = data.message;
        this.data._inicial = this.data.from && this.data.from.emailAddress.name ? this.data.from.emailAddress.name[0].toUpperCase() : 'I';
        this.data._fecha = moment(this.data.sentDateTime).format('ddd DD/MM/YYYY HH:mm');

        if (!this.message.isRead) {
          this.api.markRead(this.message.id).then(() => {
            this.events.onEmailNotification.next({ action: 'markread', id: this.message.id })
          })
        }
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
      this.mostrarData = true;
    }
  }
  recargar() {
    this.mostrarCargando = true;
    this.mostrarData = false;
    this.cargar();
  }
  async responder() {
    try {
      await this.mensaje.responder(this.message.id, this.data);
    }
    catch (error: any) {
      this.snackbar.showToast('Ha ocurrido un error inesperado mientras se generaba el correo. Vuelva a intentar.');
    }
  }
  async eliminar() {
    this.deshabilitaEliminar = true;
    const snackbar = await this.snackbar.create('Eliminado...', false, 'medium');

    snackbar.present();

    try {
      const response = await this.api.deleteMessage(this.message.id)
      const { data } = response;

      if (data.success) {
        this.nav.pop();
        this.events.onEmailNotification.next({ action: 'delete', id: this.message.id });
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
        return;
      }
      this.snackbar.showToast('No pudimos eliminar el mensaje. Vuelva a intentar.', 3000, 'danger');
    }
    finally {
      snackbar.dismiss();
      this.deshabilitaEliminar = false;
    }
  }
  async descargarAdjunto(file: any) {
    const snackbar = await this.snackbar.create('Descargando...', false);
    const params = { messageId: this.message.id, attachmentId: file.id };
    snackbar.present();

    try {
      const response = await this.api.downloadAttachment(params);
      const { data } = response;

      if (data.success) {
        const file = data.data;
        const content = `data:${file.contentType};base64,${file.base64}`;
        this.utils.openFile(file.name, file.contentType, content);
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
      this.snackbar.showToast('No pudimos descargar el archivo. Vuelva a intentar.', 3000, 'danger');
    }
    finally {
      snackbar.dismiss();
    }
  }
  resolverIcono(contentType: string) {
    if (contentType == 'image') return 'image';
    if (contentType == 'application/pdf') return 'picture_as_pdf';
    else return 'insert_drive_file';
  }
  bytesToSize(bytes: number) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  }

}
