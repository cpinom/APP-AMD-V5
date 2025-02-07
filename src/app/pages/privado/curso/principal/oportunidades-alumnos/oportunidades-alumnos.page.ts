import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { AppGlobal } from '../../../../../app.global';
import { VISTAS_DOCENTE } from 'src/app/app.contants';

@Component({
  selector: 'app-oportunidades-alumnos',
  templateUrl: './oportunidades-alumnos.page.html',
  styleUrls: ['./oportunidades-alumnos.page.scss'],
})
export class OportunidadesAlumnosPage implements OnInit {

  seccion: any;
  alumnos: any;
  alumnosFiltrados: any;
  mostrarCargando = true;
  mostrarData = false;

  filtro = 0;
  oportunidades: any;
  ordinales: any = ["Ninguna", "Primera", "Segunda", "Tercera", "Cuarta", "Quinta", "Sexta", "Séptima", "Octava", "Novena", "Décima"];

  constructor(private api: CursoService,
    private global: AppGlobal,
    private error: ErrorService) { }

  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.seccion = JSON.parse(result.value!);
      this.cargar();
    });

    this.api.marcarVista(VISTAS_DOCENTE.WIDGET_OPORTUNIDADES);
  }
  async cargar(forceRefresh = false) {
    try {
      const params = {
        seccCcod: this.seccion.seccCcod,
        ssecNcorr: this.seccion.ssecNcorr
      };
      const response = await this.api.getOportunidadesDetalle(params, forceRefresh);
      const { data } = response;

      if (data.success) {
        this.alumnos = data.alumnos;
        this.alumnosFiltrados = data.alumnos;
        this.procesarOportunidades();
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
      ev && ev.target.complete();
    })
  }
  resolverFoto(persNcorr: any) {
    return `${this.global.Api}/api/v4/avatar/${persNcorr}`;
  }
  resolverColor(filtro: number) {
    return (filtro == this.filtro) ? 'solid' : 'outline';
  }
  aplicarFiltro(filtro: number) {
    this.filtro = filtro;

    if (filtro == 0) {
      this.alumnosFiltrados = this.alumnos;
    } else {
      this.alumnosFiltrados = this.alumnos.filter((t: any) => t.alrsNoportunidad == filtro);
    }
  }
  resolverContador(filtro: number) {
    if (filtro == 0) return 'Todos';
    return `${this.ordinales[filtro]} Oportunidad`;
  }
  procesarOportunidades() {
    let oportunidades: any = [0];

    this.alumnos.forEach((alumno: any) => {
      if (!oportunidades.includes(alumno.alrsNoportunidad)) {
        oportunidades.push(alumno.alrsNoportunidad)
      }
    });

    this.oportunidades = oportunidades;
  }

}
