import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { IonNav } from '@ionic/angular';
import { EvaluacionesService } from 'src/app/core/services/curso/evaluaciones.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { CalificacionesPage } from '../calificaciones/calificaciones.page';
import { VISTAS_DOCENTE } from 'src/app/app.contants';

@Component({
  selector: 'app-evaluaciones',
  templateUrl: './evaluaciones.page.html',
  styleUrls: ['./evaluaciones.page.scss'],
})
export class EvaluacionesPage implements OnInit {

  seccion: any;
  evaluaciones: any;
  mostrarCargando = true;
  mostrarData = false;

  constructor(private api: EvaluacionesService,
    private error: ErrorService,
    private nav: IonNav) { }

  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.seccion = JSON.parse(result.value!);
      this.cargar();
    });

    this.api.marcarVista(VISTAS_DOCENTE.NOTAS);
  }
  async cargar(forceRefresh = false) {
    try {
      const params = {
        seccCcod: this.seccion.seccCcod,
        ssecNcorr: this.seccion.ssecNcorr,
        asigCcod: this.seccion.asigCcod
      };
      const response = await this.api.getPrincipal(params, forceRefresh);
      const { data } = response;

      if (data.success) {
        this.evaluaciones = data.evaluaciones;
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
  recargar(ev: any) {
    this.cargar(true).finally(() => {
      ev.target.complete();
    });
  }
  async calificaciones(evaluacion: any) {
    await this.nav.push(CalificacionesPage, { evaluacion: evaluacion })
  }
  resolverIconoEvaluacion(evaluacion: any) {
    if (evaluacion.evaluacionPendiente) {
      return 'lock';
    }
    if (evaluacion.evaluacionCierre) {
      return 'lock';
    }
    return 'lock_open';
  }
  resolverColorEvaluacion(evaluacion: any) {
    if (evaluacion.evaluacionPendiente) {
      return 'medium';
    }
    if (evaluacion.evaluacionCierre) {
      return 'medium';
    }
    return 'info';
  }


}
