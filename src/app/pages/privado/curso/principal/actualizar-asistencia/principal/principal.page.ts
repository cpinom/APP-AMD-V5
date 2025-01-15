import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { IonNav, LoadingController, ModalController, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { AppGlobal } from '../../../../../../app.global';
import { ExcepcionPage } from '../excepcion/excepcion.page';
import { Geolocation } from '@capacitor/geolocation';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

enum Filtro {
  todos = 1,
  presentes = 2,
  ausentes = 3
};

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
})
export class PrincipalPage implements OnInit {

  seccion: any;
  alumnos: any;
  alumnosFiltrados: any;
  jefeCarrera: any;
  filtroAsistencia = Filtro.ausentes;
  mostrarCargando = true;
  coordinadas: any;

  constructor(private api: CursoService,
    private global: AppGlobal,
    private modalCtrl: ModalController,
    private error: ErrorService,
    private loading: LoadingController,
    private nav: IonNav,
    private pt: Platform,
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
        this.aplicarFiltro(this.filtroAsistencia);
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
  procesarAsistencia(data: any) {
    data.asistenciaActual = data.asistenciaActual == 0 || data.asistenciaActual == 1 ? 2 : 1;
    this.guardarAsistencia();
  }
  async guardarAsistencia() {
    let alumnos: any[] = [];

    this.alumnos.forEach((alumno: any) => {
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
      }
      const response = await this.api.guardarAsistencia(params);
      const { data } = response;

      if (data.success) {
        this.alumnos = data.alumnos;
        this.aplicarFiltro(this.filtroAsistencia);
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
  async cerrar() {
    await this.modalCtrl.dismiss();
  }
  aplicarFiltro(filtro: Filtro) {
    this.filtroAsistencia = filtro;

    if (this.filtroAsistencia == Filtro.todos) {
      this.alumnosFiltrados = this.alumnos;
    }
    if (filtro == Filtro.presentes) {
      this.alumnosFiltrados = this.alumnos.filter((t: any) => t.asistenciaActual == 2);
    }
    if (filtro == Filtro.ausentes) {
      this.alumnosFiltrados = this.alumnos.filter((t: any) => t.asistenciaActual == 1);
    }
  }
  resolverContador(filtro: Filtro) {
    if (filtro == Filtro.todos) {
      return 'Todos' + (this.alumnos ? ' (' + this.alumnos.length + ')' : '');
    }
    if (filtro == Filtro.presentes) {
      return 'Presentes' + (this.alumnos ? ' (' + this.alumnos.filter((t: any) => t.asistenciaActual == 2).length + ')' : '');
    }
    if (filtro == Filtro.ausentes) {
      return 'Ausentes' + (this.alumnos ? ' (' + this.alumnos.filter((t: any) => t.asistenciaActual == 1).length + ')' : '');
    }
    return '';
  }
  resolverDia(lclaFclase: string) {
    return moment(lclaFclase, 'DD/MM/YYYY').format('dddd');
  }
  resolverFoto(persNcorr: any) {
    return `${this.global.Api}/api/v4/avatar/${persNcorr}`;
  }
  resolverColor(filtro: Filtro) {
    return (filtro == this.filtroAsistencia) ? 'info' : 'secondary';
  }
  resolverOportunidad(alnoNoportunidad: number) {
    if (alnoNoportunidad == 1) return 'Primera Oportunidad';
    if (alnoNoportunidad == 2) return 'Segunda Oportunidad';
    if (alnoNoportunidad == 3) return 'Tercera Oportunidad';
    if (alnoNoportunidad == 4) return 'Cuarta Oportunidad';
    return '';
  }
  async reportarExcepcion() {
    await this.nav.push(ExcepcionPage, {
      seccion: this.seccion,
      alumnos: this.alumnos,
      jefeCarrera: this.jefeCarrera
    })

  }
  get permitirReportar() {
    if (!this.mostrarCargando && (this.alumnos && this.alumnos.length)) return true;
    return false;
  }
}