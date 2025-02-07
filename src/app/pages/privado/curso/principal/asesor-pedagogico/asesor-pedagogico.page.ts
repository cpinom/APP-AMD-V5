import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { LoadingController, ModalController } from '@ionic/angular';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { AppGlobal } from '../../../../../app.global';
import { SolicitudApoyoPage } from './solicitud-apoyo/solicitud-apoyo.page';
import { ErrorService } from 'src/app/core/services/error.service';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-asesor-pedagogico',
  templateUrl: './asesor-pedagogico.page.html',
  styleUrls: ['./asesor-pedagogico.page.scss'],
})
export class AsesorPedagogicoPage implements OnInit {

  seccion: any;
  alumnos: any;
  alumnosFiltrados: any;
  alumnosFiltro!: string;
  mostrarCargando = true;
  mostrarData = false;
  categorias: any;

  constructor(private api: CursoService,
    private global: AppGlobal,
    private modal: ModalController,
    private loading: LoadingController,
    private error: ErrorService,
    private snackbar: SnackbarService) { }

  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.seccion = JSON.parse(result.value!);
      this.cargar();
    });

    this.api.marcarVista(VISTAS_DOCENTE.WIDGET_ASESOR);
  }
  async cargar(forceRefresh = false) {
    try {
      const params = {
        periCcod: this.seccion.periCcod,
        seccCcod: this.seccion.seccCcod,
        ssecNcorr: this.seccion.ssecNcorr
      };
      const response = await this.api.getApoyoProgresion(params, forceRefresh);
      const { data } = response;

      if (data.success) {
        this.alumnos = data.alumnos;
        this.alumnosFiltrados = data.alumnos;
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
  recargar(ev?: any) {
    this.cargar(true).finally(() => {
      ev&&ev.target.complete();
    });
  }
  filtrarAlumnos() {
    this.alumnosFiltrados = this.alumnos.filter((element: any) => {
      let nombre = `${element.persTapePaterno}, ${element.persTnombre}`;
      var text = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      var filter = this.alumnosFiltro.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      var index = text.indexOf(filter);

      return index > -1;
    });
  }
  resetAlumnos() {
    this.alumnosFiltro = '';
    this.alumnosFiltrados = this.alumnos;
  }
  async solicitar() {
    this.categorias = await this.api.getStorage('categorias');

    if (!this.categorias) {
      let loading = await this.loading.create({ message: 'Espere...' });

      await loading.present();

      try {
        const response = await this.api.getCategoriasTutorias();
        const { data } = response;

        if (data.success) {
          this.categorias = data.categorias;
          this.api.setStorage('categorias', this.categorias);
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
        await loading.dismiss();
      }
    }

    let alumnos = this.alumnos.filter((t: { selected: boolean; }) => t.selected === true);
    let modal = await this.modal.create({
      component: SolicitudApoyoPage,
      componentProps: {
        alumnos: alumnos,
        seccion: this.seccion,
        categorias: this.categorias
      }
    });

    await modal.present();

    let response = await modal.onWillDismiss();

    if (response.data && response.data.action == 'reload') {
      this.cargar();
    }
  }
  resolverFoto(persNcorr: any) {
    return `${this.global.Api}/api/v4/avatar/${persNcorr}`;
  }
  resolverCssAlumno(alnoCriesgoAlumno: string) {
    if (alnoCriesgoAlumno == 'Sin Riesgo') return 'verde';
    if (alnoCriesgoAlumno == 'Riesgo Asistencia' || alnoCriesgoAlumno == 'Riesgo Nota') return 'amarillo';
    if (alnoCriesgoAlumno == 'Reprobado Asistencia' || alnoCriesgoAlumno == 'Reprobado Nota') return 'rojo';
    if (alnoCriesgoAlumno == 'R.Nota y Asistencia') return 'rojo';
    return 'verde';
  }
  resolverOportunidad(alnoNoportunidad: number) {
    if (alnoNoportunidad == 1) return 'Primera Oportunidad';
    if (alnoNoportunidad == 2) return 'Segunda Oportunidad';
    if (alnoNoportunidad == 3) return 'Tercera Oportunidad';
    if (alnoNoportunidad == 4) return 'Cuarta Oportunidad';
    return '';
  }
  resolverBitacora(data: any, index: number) {

    if (data.amtuNcorr > 0) {
      if (index == 0) return data.amtuFsolicitud;
      if (index == 1) {
        if (data.amtuNestado == 0) return 'Solicitud enviada'
        return 'Ver respuesta';
      }
    }
    else {
      let bitacora = data.estado;
      if (!bitacora) return index == 0 ? 'Sin Registro' : 'Sin Solicitud';
      let arr = bitacora.split('|');
      if (arr.length == 2) return arr[index];
    }
  }
  get habilitaSolicitud() {
    if (this.alumnos && this.alumnos.length) {
      return this.alumnos.filter((t: { selected: boolean; }) => t.selected === true).length > 0
    }
    return false;
  }

}
