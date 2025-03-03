import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AsistenciaService } from 'src/app/core/services/curso/asistencia.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { AppGlobal } from '../../../../app.global';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import * as moment from 'moment';

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
  displayedColumns: any[] = [];
  infoColumns: any[] = [];
  muestraTomaConocimiento: any;

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
    debugger
    try {
      const seccCcod = this.data.seccCcod;
      const ssecNcorr = this.data.ssecNcorr;
      const response = await this.api.getPrincipalV5(seccCcod, ssecNcorr);

      if (response.data.success) {
        const { data } = response.data;
        this.muestraTomaConocimiento = data.muestraTomaConocimiento;
        await this.resolverAsistencia(data.alumnos);
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
  async resolverAsistencia(data: any) {
    this.displayedColumns = ['persTnombre', 'asistencia'];
    this.infoColumns = [];

    try {
      data.forEach((alumno: any) => {

        alumno.clases.forEach((clase: any) => {

          if (!alumno.hasOwnProperty(clase.lclaNcorr.toString())) {
            alumno[clase.lclaNcorr.toString()] = clase;
          }

          if (!this.displayedColumns.includes(clase.lclaNcorr.toString())) {
            this.displayedColumns.push(clase.lclaNcorr.toString());

            let fecha = moment(clase.lclaFclase, 'DD/MM/YYYY');
            let diaSemana = fecha.format("ddd").replace('.', '');
            diaSemana = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

            this.infoColumns.push({
              key: clase.lclaNcorr.toString(),
              label: `${diaSemana} ${fecha.format("DD/MM/YYYY")}`
            });
          }

        });

      });

      this.alumnos = data;

      return Promise.resolve();
    }
    catch {
      return Promise.reject();
    }
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

}
