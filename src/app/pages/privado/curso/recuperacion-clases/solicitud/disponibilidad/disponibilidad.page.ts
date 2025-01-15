import { Component, OnInit } from '@angular/core';
import { ActionSheetController, LoadingController, ModalController } from '@ionic/angular';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { RecuperacionesService } from 'src/app/core/services/curso/recuperaciones.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-disponibilidad',
  templateUrl: './disponibilidad.page.html',
  styleUrls: ['./disponibilidad.page.scss'],
})
export class DisponibilidadPage implements OnInit {

  bloques!: any[];
  data: any;

  constructor(private action: ActionSheetController,
    private loading: LoadingController,
    private api: RecuperacionesService,
    private snackbar: SnackbarService,
    private modal: ModalController,
    private error: ErrorService) { }

  ngOnInit() { }
  async enviarSolicitud(bloque: any) {
    const loading = await this.loading.create({ message: 'Procesando...' });

    await loading.present();

    try {
      const params = Object.assign(this.data, { salaCcod: bloque.salaCcod });
      const response = await this.api.generarSolicitud(params);
      const { data } = response;

      if (data.success) {
        this.snackbar.showToast('Solicitud registrada correctamente.', 3000, 'success');
        this.modal.dismiss({ action: 'reload' });
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

      this.snackbar.showToast('No pudimos procesar su solicitud. Vuelva a intentar.', 3000, 'danger');
    }
    finally {
      loading.dismiss();
    }
  }
  async solicitar(bloque: any) {
    const actionSheet = await this.action.create({
      header: '¿Está seguro de enviar esta solicitud?',
      subHeader: 'test',
      buttons: [
        {
          text: 'Continuar',
          role: 'destructive',
          handler: async () => {
            await this.enviarSolicitud(bloque);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

}
