import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AsistenciaService } from 'src/app/core/services/curso/asistencia.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { AppGlobal } from '../../../../app.global';
import { VISTAS_DOCENTE } from 'src/app/app.contants';

@Component({
  selector: 'app-asistencia-clases',
  templateUrl: './asistencia-clases.page.html',
  styleUrls: ['./asistencia-clases.page.scss'],
})
export class AsistenciaClasesPage implements OnInit {

  data: any;
  alumnos: any;
  mostrarCargando = true;
  mostrarData = false;

  constructor(private api: AsistenciaService,
    private global: AppGlobal,
    private error: ErrorService) { }

  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.data = JSON.parse(result.value!);
      this.cargar();
    });

    this.api.marcarVista(VISTAS_DOCENTE.CURSO_ASISTENCIA);
  }
  async cargar(forceRefresh = false) {
    try {
      const params = { seccCcod: this.data.seccCcod, ssecNcorr: this.data.ssecNcorr };
      const response = await this.api.getPrincipal(params, forceRefresh);
      const { data } = response;

      if (data.success) {
        this.alumnos = data.alumnos;
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
  resolverFoto(persNcorr: any) {
    return `${this.global.Api}/api/v4/avatar/${persNcorr}`;
  }
  resolverOportunidad(alnoNoportunidad: number) {
    if (alnoNoportunidad == 1) return 'Primera Oportunidad';
    if (alnoNoportunidad == 2) return 'Segunda Oportunidad';
    if (alnoNoportunidad == 3) return 'Tercera Oportunidad';
    if (alnoNoportunidad == 4) return 'Cuarta Oportunidad';
    return '';
  }
  get clases() {
    let clases: any[] = [];

    if (this.alumnos && this.alumnos.length) {
      this.alumnos.forEach((alumno: any) => {
        if (alumno.clases.length > clases.length) {
          clases = alumno.clases;
        }
      });

      clases.forEach((clase: any) => {
        clase.tieneComentario = clase.lcmoTcomentario.length > 0
      })
    }

    return clases;
  }

}
