import { Component, OnInit, ViewChild } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { IonPopover, LoadingController, ModalController, PopoverController } from '@ionic/angular';
import { RecuperacionesService } from 'src/app/core/services/curso/recuperaciones.service';
import { SolicitudPage } from './solicitud/solicitud.page';
import * as moment from 'moment';
import { param } from 'jquery';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { ErrorService } from 'src/app/core/services/error.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-recuperacion-clases',
  templateUrl: './recuperacion-clases.page.html',
  styleUrls: ['./recuperacion-clases.page.scss'],
})
export class RecuperacionClasesPage implements OnInit {

  @ViewChild('popover') popover!: IonPopover;
  seccion: any;
  recuperaciones: any;
  solicitudes: any;
  recuperacion: any;
  horario: any;
  tiposSalas: any;
  implementos: any;
  isOpen = false;
  mostrarData = false;
  mostrarCargando = true;
  solicitud: any;

  suspendidas: any[] | undefined;
  aprobadas: any[] | undefined;
  segmento: any;

  constructor(private api: RecuperacionesService,
    private modal: ModalController,
    private loading: LoadingController,
    private error: ErrorService,
    private snackbar: SnackbarService) { }

  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.seccion = JSON.parse(result.value!);
      this.cargar();
    });

    this.api.marcarVista(VISTAS_DOCENTE.RECUPERACIONES);
  }
  async cargar(forceRefresh = false) {
    debugger
    try {
      const periCcod = this.seccion.periCcod;
      const sedeCcod = this.seccion.sedeCcod;
      const asigCcod = this.seccion.asigCcod;
      const seccCcod = this.seccion.seccCcod;
      const ssecNcorr = this.seccion.ssecNcorr;
      const response = await this.api.getPrincipalV5(periCcod, sedeCcod, asigCcod, seccCcod, ssecNcorr);
      const { data } = response;

      if (data.success) {
        this.suspendidas = data.data.suspendidas;
        this.aprobadas = data.data.aprobadas;
        // this.recuperaciones = data.recuperaciones;
        // this.solicitudes = data.solicitudes;
        // this.tiposSalas = data.tiposSalas;
        // this.horario = data.horario;
        // this.implementos = data.implementos;
        // this.recuperacion = null;
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
  recargar(ev: any) {
    this.cargar(true).finally(() => {
      ev.target.complete();
    });
  }
  async solicitar() {
    let modal = await this.modal.create({
      component: SolicitudPage,
      componentProps: {
        data: {
          seccion: this.seccion,
          clase: this.recuperacion,
          horario: this.horario,
          tiposSalas: this.tiposSalas,
          implementos: this.implementos
        }
      }
    });

    await modal.present();

    let response = await modal.onWillDismiss();

    if (response.data && response.data.action == 'reload') {
      await this.cargar();
    }
  }
  async detalle(e: any, record: any) {
    const loading = await this.loading.create({ message: 'Cargando...' });

    loading.present();

    try {
      const params = { reclNcorr: record.reclNcorr };
      const response = await this.api.getDetalleSolicitud(params);
      const { data } = response;

      await loading.dismiss();

      if (data.success) {
        this.solicitud = data.detalle;
        this.popover.event = e;
        this.isOpen = true;
        this.api.marcarVista(VISTAS_DOCENTE.DETALLE_RECUPERACION);
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
      this.snackbar.showToast('No pudimos cargar la información. Vuelva a intentar.', 3000, 'danger');
    }
    finally {
      loading.dismiss();
    }
  }
  resolverHora(hora: string) {
    return moment(hora).format("HH:mm");
  }
  resolverEstado(estado: string, i: number) {
    if (i == 1) {
      if (estado == 'PENDIENTE') return 'warning';
      if (estado == 'APROBADO') return 'success';
      if (estado == 'RECHAZADA') return 'danger';
      return 'info';
    }
    if (i == 2) {
      if (estado == 'PENDIENTE') return 'alarm';
      if (estado == 'APROBADO') return 'check_circle';
      if (estado == 'RECHAZADA') return 'cancel';
      return 'info';
    }
    return '';
  }

}
