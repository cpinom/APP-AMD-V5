import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { LoadingController, ModalController, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { AppGlobal } from '../../../../app.global';
import { ExcepcionPage } from './excepcion/excepcion.page';
import { Geolocation } from '@capacitor/geolocation';
import { ErrorService } from 'src/app/core/services/error.service';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-registro-asistencia',
  templateUrl: './registro-asistencia.page.html',
  styleUrls: ['./registro-asistencia.page.scss'],
})
export class RegistroAsistenciaPage implements OnInit {

  seccion: any;
  alumnos: any;
  jefeCarrera: any;
  mostrarCargando = true;
  // coordinadas: any

  constructor(private api: CursoService,
    private global: AppGlobal,
    private modalCtrl: ModalController,
    private loading: LoadingController,
    private pt: Platform,
    private error: ErrorService,
    private snackbar: SnackbarService) {
    moment.locale('es');
  }

  async ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.seccion = JSON.parse(result.value!);
      this.cargar();
    });

    // let permission = await Geolocation.checkPermissions();
    // let coordinates: any;

    // if (permission.location == 'denied' || permission.location == 'prompt') {
    //   if (this.pt.is('capacitor')) {
    //     permission = await Geolocation.requestPermissions();
    //   }
    // }

    // try {
    //   coordinates = await Geolocation.getCurrentPosition();
    // }
    // catch { }

    // this.coordinadas = coordinates;
  }
  async cargar() {
    try {
      const params = { seccCcod: this.seccion.seccCcod, lclaNcorr: this.seccion.lclaNcorr };
      const response = await this.api.getAsistenciaClase(params);
      const { data } = response;

      if (data.success) {
        this.alumnos = data.alumnos;
        this.jefeCarrera = data.jefeCarrera;
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
    }
  }
  async reportar() {
    let modal = await this.modalCtrl.create({
      component: ExcepcionPage,
      componentProps: {
        seccion: this.seccion,
        alumnos: this.alumnos,
        jefeCarrera: this.jefeCarrera
      }
    });

    await modal.present();
  }
  async marcarPresentes() {
    this.alumnos.forEach((item: { asistenciaActual: number; }) => item.asistenciaActual = 2);
    await this.guardarAsistencia();
  }
  async procesarAsistencia(alumno: any) {
    alumno.asistenciaActual = alumno.asistenciaActual == 0 || alumno.asistenciaActual == 1 ? 2 : 1;
    await this.guardarAsistencia();
  }
  async guardarAsistencia() {
    let alumnos: { persNcorr: any; esasNcorr: any; }[] = [];

    this.alumnos.forEach((alumno: { persNcorr: any; asistenciaActual: any; }) => {
      alumnos.push({
        persNcorr: alumno.persNcorr,
        esasNcorr: alumno.asistenciaActual
      });
    });

    const loading = await this.loading.create({ message: 'Guardando...' });

    await loading.present();

    try {
      // const params = {
      //   lclaNcorr: this.seccion.lclaNcorr,
      //   alumnos: alumnos,
      //   lcmoNlatitud: this.coordinadas ? this.coordinadas.coords.latitude : null,
      //   lcmoNlongitud: this.coordinadas ? this.coordinadas.coords.longitude : null
      // }
      const params = {
        lclaNcorr: this.seccion.lclaNcorr,
        alumnos: alumnos,
        lcmoNlatitud: null,
        lcmoNlongitud: null
      };
      const response = await this.api.guardarAsistencia(params);
      const { data } = response;

      if (data.success) {
        this.alumnos = data.alumnos;
        this.api.marcarVista(VISTAS_DOCENTE.CURSO_GUARDA_ASISTENCIA);
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
  resolverFoto(persNcorr: any) {
    return `${this.global.Api}/api/v4/avatar/${persNcorr}`;
  }
  resolverDia(lclaFclase: string) {
    return moment(lclaFclase, 'DD/MM/YYYY').format('dddd');
  }
  resolverPorEstado(esasNcorr: number) {
    return this.alumnos.filter((item: { asistenciaActual: number; }) => item.asistenciaActual == esasNcorr).length;
  }
  resolverOportunidad(alnoNoportunidad: number) {
    if (alnoNoportunidad == 1) return 'Primera Oportunidad';
    if (alnoNoportunidad == 2) return 'Segunda Oportunidad';
    if (alnoNoportunidad == 3) return 'Tercera Oportunidad';
    if (alnoNoportunidad == 4) return 'Cuarta Oportunidad';
    return '';
  }
  get permitirReportar() {
    if (!this.mostrarCargando && (this.alumnos && this.alumnos.length)) return true;
    return false;
  }
}
