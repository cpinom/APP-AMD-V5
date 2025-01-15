import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { AppGlobal } from '../../../../../app.global';
import { Sort } from '@angular/material/sort';
import { VISTAS_DOCENTE } from 'src/app/app.contants';

enum Filtro {
  todos = 1,
  trabajador = 2,
  noTrabajador = 3
};

@Component({
  selector: 'app-tipos-alumnos',
  templateUrl: './tipos-alumnos.page.html',
  styleUrls: ['./tipos-alumnos.page.scss'],
})
export class TiposAlumnosPage implements OnInit {

  seccion: any;
  alumnos: any;
  alumnosFiltrados: any[] | undefined;
  mostrarCargando = true;
  mostrarData = false;
  filtroRiesgo!: Filtro;

  constructor(private api: CursoService,
    private global: AppGlobal,
    private error: ErrorService) { }
  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.seccion = JSON.parse(result.value!);
      this.cargar();
    });

    this.api.marcarVista(VISTAS_DOCENTE.WIDGET_TIPO_ESTUDIANTES);
  }
  async cargar(forceRefresh = false) {
    try {
      const params = {
        seccCcod: this.seccion.seccCcod,
        ssecNcorr: this.seccion.ssecNcorr
      };
      const response = await this.api.getTiposAlumnosDetalle(params, forceRefresh);
      const { data } = response;

      if (data.success) {
        this.alumnos = data.alumnos;
        this.alumnosFiltrados = data.alumnos;
        this.filtroRiesgo = Filtro.todos;
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
    })
  }
  resolverFoto(persNcorr: any) {
    return `${this.global.Api}/api/v4/avatar/${persNcorr}`;
  }
  resolverColor(filtro: Filtro) {
    return (filtro == this.filtroRiesgo) ? 'info' : 'secondary';
  }
  resolverContador(filtro: Filtro) {
    if (this.alumnos) {
      if (filtro == Filtro.todos) return `Todos (${this.alumnos.length})`;
      if (filtro == Filtro.trabajador) {
        let count = this.alumnos.filter((t: any) => t.alumTrabajador == 'Trabajador').length;
        return `Trabajador (${count})`;
      }
      if (filtro == Filtro.noTrabajador) {
        let count = this.alumnos.filter((t: any) => t.alumTrabajador == 'No Trabajador').length;
        return `No Trabajador (${count})`;
      }
    }
    return '';
  }
  aplicarFiltro(filtro: Filtro) {
    this.filtroRiesgo = filtro;

    if (this.filtroRiesgo == Filtro.todos) {
      this.alumnosFiltrados = this.alumnos;
    }
    if (filtro == Filtro.trabajador) {
      this.alumnosFiltrados = this.alumnos.filter((t: any) => t.alumTrabajador == 'Trabajador');
    }
    if (filtro == Filtro.noTrabajador) {
      this.alumnosFiltrados = this.alumnos.filter((t: any) => t.alumTrabajador == 'No Trabajador');
    }
  }
  ordenarAlumnos(sort: Sort) {
    const data = this.alumnos.slice();
    if (!sort.active || sort.direction === '') {
      this.alumnosFiltrados = data;
      return;
    }

    this.alumnosFiltrados = data.sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'persTapePaterno':
          return compare(a.persTapePaterno, b.persTapePaterno, isAsc);
        case 'alumTrabajador':
          return compare(a.alumTrabajador, b.alumTrabajador, isAsc);
        default: return 0;
      }
    });
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}