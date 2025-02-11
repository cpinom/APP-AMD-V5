import { Component, OnInit } from '@angular/core';
import { ActionSheetController, LoadingController, ModalController } from '@ionic/angular';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { RecuperacionesService } from 'src/app/core/services/curso/recuperaciones.service';
import { DialogService } from 'src/app/core/services/dialog.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-disponibilidad',
  templateUrl: './disponibilidad.page.html',
  styleUrls: ['./disponibilidad.page.scss'],
})
export class DisponibilidadPage implements OnInit {

  bloques!: any[];
  bloquesFiltrados: any;
  data: any;
  bloqueSeleccionado: any;
  bloqueFiltro = '';

  constructor(private action: ActionSheetController,
    private dialog: DialogService,
    private api: RecuperacionesService,
    private snackbar: SnackbarService,
    private modal: ModalController,
    private error: ErrorService) { }

  ngOnInit() {
    console.log(this.data);
    this.bloquesFiltrados = this.bloques;
  }
  async enviarSolicitud() {
    const loading = await this.dialog.showLoading({ message: 'Procesando...' });

    try {
      const params = Object.assign(this.data, { salaCcod: this.bloqueSeleccionado.salaCcod });
      const response = await this.api.generarSolicitud(params);
      const { data } = response;

      if (data.success) {
        await loading.dismiss();
        await this.presentSuccess('Solicitud de Recuperación de Clases', 'Solicitud registrada correctamente.');
        await this.modal.dismiss({ action: 'reload' });
        this.api.marcarVista(VISTAS_DOCENTE.SOLICITA_RECUPERACION);
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

      await this.snackbar.showToast('No pudimos procesar tu solicitud. Vuelva a intentar.', 3000, 'danger');
    }
    finally {
      await loading.dismiss();
    }
  }
  async solicitar() {
    const confirm = await this.showConfirmation('¿Estás seguro de enviar esta solicitud?');

    if (confirm == true) {
      await this.enviarSolicitud();
    }
  }
  async showConfirmation(message: string, header: string = 'Solicitud de Recuperación de Clases'): Promise<boolean> {
    return new Promise(async (resolve) => {
      await this.dialog.showAlert({
        header: header,
        message: message,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Enviar',
            role: 'destructive',
            handler: () => resolve(true)
          }
        ]
      });
    });
  }
  async presentSuccess(title: string, message: string) {
    const alert = await this.dialog.showAlert({
      backdropDismiss: false,
      keyboardClose: false,
      cssClass: 'success-alert',
      header: title,
      message: `<div class="image"><ion-icon src = "./assets/icon/check_circle.svg"></ion-icon></div>${message}`,
      buttons: ['Aceptar']
    });

    return alert;
  }
  resaltarTexto(item: any) {
    let returnValue = `<h2>Fecha - ${this.data.lclaFclase}</h2>
                <p>${item.salaTdesc}</p>
                <p>${item.horario}</p>`;

    if (this.bloqueFiltro.length) {
      const filtro = this.bloqueFiltro.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      let texto = returnValue.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      let startIndex = texto.indexOf(filtro);

      if (startIndex != -1) {
        let endLength = filtro.length;
        let matchingString = returnValue.substr(startIndex, endLength);
        return returnValue.replace(matchingString, "<b>" + matchingString + "</b>");
      }
    }

    return returnValue;
  }
  filtrarBloques() {
    this.bloqueSeleccionado = null;
    this.bloquesFiltrados = this.bloques.filter((item: any) => {
      let text = item.salaTdesc.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      text += item.horario.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      let filter = this.bloqueFiltro.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      let index = text.indexOf(filter);

      return index > -1;
    });
  }
  resetBloques() {
    this.bloqueSeleccionado = null;
    this.bloqueFiltro = '';
    this.bloquesFiltrados = this.bloques;
  }

}
