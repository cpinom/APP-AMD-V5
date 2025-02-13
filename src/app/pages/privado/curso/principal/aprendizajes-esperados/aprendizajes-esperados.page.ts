import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { ModalController } from '@ionic/angular';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { FiltrosPage } from './filtros/filtros.page';
import { ErrorService } from 'src/app/core/services/error.service';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { DialogService } from 'src/app/core/services/dialog.service';

@Component({
  selector: 'app-aprendizajes-esperados',
  templateUrl: './aprendizajes-esperados.page.html',
  styleUrls: ['./aprendizajes-esperados.page.scss'],
})
export class AprendizajesEsperadosPage implements OnInit {

  seccion: any;
  aprendizajes: any;
  avances: any;
  mostrarCargando = true;
  mostrarData = false;
  accordionModel = '';
  filtros = {
    lclaFclase: '',
    codClase: 0,
    codVisto: 0
  };
  clases: any[] = [];

  constructor(private api: CursoService,
    private snack: SnackbarService,
    private error: ErrorService,
    private modalCtrl: ModalController,
    private dialog: DialogService,
    private snackbar: SnackbarService) { }

  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.seccion = JSON.parse(result.value!);
      this.filtros.lclaFclase = this.seccion.lclaFclase;
      this.cargar();
    });

    this.api.marcarVista(VISTAS_DOCENTE.CURSO_APRENDIZAJES_ESPERADOS);
  }
  async cargar(forceRefresh = false) {
    const params = {
      periCcod: this.seccion.periCcod,
      asigCcod: this.seccion.asigCcod,
      seccCcod: this.seccion.seccCcod,
      lclaFclase: '',
      codClase: this.filtros.codClase,
      codVisto: this.filtros.codVisto
    };

    try {
      const fechaAno = this.seccion.lclaFclase.split('/').pop();
      const response = await this.api.getAvancesAprendizajes(params, forceRefresh);
      const { data } = response;

      if (data.success) {
        this.clases = data.avances.map((avance: any) => {
          return `${avance.fecha}/${fechaAno}`;
        });
        this.aprendizajes = data.aprendizajes;
        this.avances = data.avances.filter((avance: any) => `${avance.fecha}/${fechaAno}` == this.filtros.lclaFclase);
        this.accordionModel = 'avance';
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
    this.mostrarData = false;
    this.mostrarCargando = ev ? false : true;
    this.cargar(true).finally(() => {
      ev && ev.target.complete();
    });
  }
  async filtrar() {
    const params = {
      periCcod: this.seccion.periCcod,
      asigCcod: this.seccion.asigCcod,
      seccCcod: this.seccion.seccCcod,
      lclaFclase: this.filtros.lclaFclase,
      codClase: this.filtros.codClase,
      codVisto: this.filtros.codVisto
    };

    try {
      const response = await this.api.getAvancesAprendizajes(params, true);
      const { data } = response;

      if (data.success) {
        this.aprendizajes = data.aprendizajes;
        this.avances = data.avances;
        this.accordionModel = 'avance';
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
  }
  async mostrarFiltros(e: any) {
    e.stopPropagation();

    const modal = await this.modalCtrl.create({
      component: FiltrosPage,
      componentProps: Object.assign({ clases: this.clases }, this.filtros),
      breakpoints: [0, 0.35],
      initialBreakpoint: 0.35
    });

    modal.onWillDismiss().then(result => {
      if (result.data) {
        debugger
        this.filtros = result.data;
        this.filtrar();
      }
    });

    await modal.present();
  }
  async guardar(data: any, lclaNcorr: any) {
    const loading = await this.dialog.showLoading({ message: 'Guardando...' });
    const params = {
      codAsun: data.asunCcod,
      codAprendizaje: data.unobCcod,
      codLibros: lclaNcorr
    };

    try {
      const response = await this.api.actualizaAvancesAprendizajes(params);
      const { data } = response;

      if (data.success) {
        this.snack.showToast('Cambios guardados correctamente.', 2000, 'success');
        this.cargar();
        this.api.marcarVista(VISTAS_DOCENTE.CURSO_GUARDA_APRENDIZAJES_ESPERADOS);
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
  resolverEstadoClase(data: any) {
    if (data.libro && !data.recuperacion && data.asistencia > 0) {
      if (data.objetivos.filter((t: { visto: number; }) => t.visto == 2).length == data.objetivos.length) {
        return 'Clase Realizada sin Aprendizaje Esperado';
      }
      return 'Clase Realizada';
    }
    if (data.libro && data.recuperacion) {
      return 'Clase con Recuperación';
    }
    if (!data.libro) {
      return 'Clase No Realizada';
    }
    return '';
  }

}
