import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { IonNav } from '@ionic/angular';
import * as moment from 'moment';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { AppGlobal } from '../../../../../../app.global';
import { ExcepcionPage } from '../excepcion/excepcion.page';
import { Geolocation } from '@capacitor/geolocation';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { DialogService } from 'src/app/core/services/dialog.service';

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
    private error: ErrorService,
    private nav: IonNav,
    private dialog: DialogService,
    private snackbar: SnackbarService) {
    moment.locale('es');
  }
  async ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.seccion = JSON.parse(result.value!);
      this.cargar();
    });
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
  async procesarAsistencia(alumno: any) {
    if (alumno.asistenciaActual == 0) {
      alumno.asistenciaActual = 2;
    }
    else if (alumno.asistenciaActual == 2) {

      if (alumno.rasiFregistroInicio && !alumno.rasiFregistroTermino) {
        const resultUsario = await this.resolverMarcaAsistencia();

        if (resultUsario == 'AUSENTE') {
          alumno.asistenciaActual = 1;
        }
        else if (resultUsario == 'RETIRO_ANTICIPADO') {
          alumno.retiroAnticipado = true;
        }
        else {
          return;
        }
      }
      else if (alumno.rasiFregistroInicio && alumno.rasiFregistroTermino) {
        const confirm = await this.confirmarMarcaAusencia();

        if (!confirm) {
          return;
        }

        alumno.asistenciaActual = 1;
      }
    }
    else if (alumno.asistenciaActual == 1) {
      alumno.asistenciaActual = 2;
    }
    else {
      return;
    }

    await this.guardarAsistencia();
  }
  async guardarAsistencia() {
    let alumnos: any[] = [];

    this.alumnos.forEach((alumno: any) => {
      alumnos.push({
        persNcorr: alumno.persNcorr,
        esasNcorr: alumno.asistenciaActual,
        retiroAnticipado: alumno.retiroAnticipado === true
      });
    });

    const loading = await this.dialog.showLoading({ message: 'Guardando...' });

    try {
      const params = {
        lclaNcorr: this.seccion.lclaNcorr,
        alumnos: alumnos,
        lcmoNlatitud: null,
        lcmoNlongitud: null
      }
      const response = await this.api.guardarAsistenciaV5(params);
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

      await this.snackbar.showToast('No pudimos procesar su solicitud. Vuelva a intentar.', 3000, 'danger');
    }
    finally {
      await loading.dismiss();
    }
  }
  async resolverMarcaAsistencia(): Promise<string | null> {
    return new Promise(async (resolve) => {
      await this.dialog.showAlert({
        header: 'Selecciona una marca',
        inputs: [
          {
            name: 'opcion',
            type: 'radio',
            label: 'Marcar Retiro Anticipado',
            value: 'RETIRO_ANTICIPADO'
          },
          {
            name: 'opcion',
            type: 'radio',
            label: 'Marcar Ausente',
            value: 'AUSENTE'
          }
        ],
        buttons: [
          {
            text: 'Cerrar',
            role: 'cancel',
            handler: () => resolve(null) // Retorna null si el usuario cierra sin elegir
          },
          {
            text: 'Aceptar',
            handler: (data) => resolve(data) // Retorna la opción elegida
          }
        ]
      });
    });
  }
  async confirmarMarcaAusencia(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.dialog.showAlert({
        header: 'Asistencia',
        message: '¿Desea marcar como Ausente al estudiante?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Aceptar',
            role: 'destructive',
            handler: () => resolve(true)
          }
        ]
      });
    });
  }
  async cerrar() {
    await this.dialog.dismissModal();
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
    return (filtro == this.filtroAsistencia) ? 'solid' : 'outline';
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
    });
  }
  get permitirReportar() {
    if (!this.mostrarCargando && (this.alumnos && this.alumnos.length)) return true;
    return false;
  }
}