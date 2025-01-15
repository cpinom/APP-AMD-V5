import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { unitOfTime } from 'moment';
import { ErrorService } from 'src/app/core/services/error.service';
import { PerfilService } from 'src/app/core/services/perfil.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { AppGlobal } from '../../../app.global';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { EventsService } from 'src/app/core/services/events.services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
})
export class NotificacionesPage implements OnInit, OnDestroy {

  notificaciones: any;
  mostrarCargando = true;
  mostrarData = false;
  mostrarEmpty = false;
  eventSubscription!: Subscription;

  constructor(private modalCtrl: ModalController,
    private api: PerfilService,
    private error: ErrorService,
    private snackbar: SnackbarService,
    private global: AppGlobal,
    private events: EventsService) {

    this.eventSubscription = this.events.app.subscribe((event: any) => {
      if (event.action == 'onNotificacionRecibida') {
        this.cargar(true);
      }
    });

  }
  ngOnInit() {
    this.cargar();
    this.api.marcarVista(VISTAS_DOCENTE.NOTIFICACIONES);
  }
  ngOnDestroy() {
    this.eventSubscription.unsubscribe();
  }
  async cargar(forceRefresh = false) {
    try {
      const response = await this.api.notificaciones(forceRefresh);
      const { data } = response;

      if (data.success) {
        this.procesarNotificaciones(data.notificaciones);
        this.global.NotificationFlag = false;
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
    }
    finally {
      this.mostrarCargando = false;
      this.mostrarData = true;
    }
  }
  async recargar() {
    this.mostrarCargando = true;
    this.mostrarData = false;
    setTimeout(() => {
      this.cargar();
    }, 500);
  }
  procesarNotificaciones(data: any[]) {
    let nuevas: any[] = [];
    let semanales: any[] = [];
    let mensuales: any[] = [];
    let antiguas: any[] = [];

    data.forEach(item => {
      let fechaEnvio = moment(item.nopeFregistro, 'DD/MM/YYYY HH:mm');
      let primerDiaSemana = moment().startOf('isoweek' as unitOfTime.StartOf);
      let primerDiaMes = moment().startOf('month');
      let esHoy = fechaEnvio.isSame(new Date(), 'day');
      let esAyer = fechaEnvio.isSame(moment().subtract(1, 'day'), 'day');

      if (esHoy || esAyer) {
        nuevas.push(item);
      } else if (fechaEnvio.isSameOrAfter(primerDiaSemana)) {
        semanales.push(item);
      } else if (fechaEnvio.isSameOrAfter(primerDiaMes)) {
        mensuales.push(item);
      } else {
        antiguas.push(item);
      }
    });

    this.notificaciones = {};
    this.notificaciones[0] = nuevas;
    this.notificaciones[1] = semanales;
    this.notificaciones[2] = mensuales;
    this.notificaciones[3] = antiguas;
    this.mostrarEmpty = !nuevas.length && !semanales.length && !mensuales.length && !antiguas.length;
  }
  async eliminarNotificacion(data: any) {
    this.mostrarCargando = true;
    let params = { nopeNcorr: data.nopeNcorr };

    try {
      const response = await this.api.eliminarNotificacion(params);
      const { data } = response;

      if (data.success) {
        this.procesarNotificaciones(data.notificaciones);
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
  async eliminarTodo() {
    this.mostrarCargando = true;

    try {
      const params = {};
      const response = await this.api.eliminarNotificaciones(params);
      const { data } = response;

      if (data.success) {
        this.procesarNotificaciones(data.notificaciones);
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
  async cerrar() {
    await this.modalCtrl.dismiss();
  }

}
