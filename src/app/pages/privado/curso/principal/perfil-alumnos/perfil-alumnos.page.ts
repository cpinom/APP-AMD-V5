import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { AppGlobal } from '../../../../../app.global';
import { Sort } from '@angular/material/sort';
import { VISTAS_DOCENTE } from 'src/app/app.contants';

@Component({
  selector: 'app-perfil-alumnos',
  templateUrl: './perfil-alumnos.page.html',
  styleUrls: ['./perfil-alumnos.page.scss'],
})
export class PerfilAlumnosPage implements OnInit {

  seccion: any;
  alumnos: any;
  alumnosData: any;
  mostrarCargando = true;
  mostrarData = false;

  constructor(private api: CursoService,
    private global: AppGlobal,
    private error: ErrorService) { }

  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.seccion = JSON.parse(result.value!);
      this.cargar();
    });

    this.api.marcarVista(VISTAS_DOCENTE.WIDGET_PERFIL_ESTUDIANTES);
  }
  async cargar(forceRefresh = false) {
    try {
      const params = {
        seccCcod: this.seccion.seccCcod,
        ssecNcorr: this.seccion.ssecNcorr
      };
      const response = await this.api.getPerfilAlumnosDetalle(params, forceRefresh);
      const { data } = response;

      if (data.success) {
        this.alumnos = data.alumnos;
        this.alumnosData = data.alumnos;
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
  ordenarAlumnos(sort: Sort) {
    const data = this.alumnosData.slice();
    if (!sort.active || sort.direction === '') {
      this.alumnos = data;
      return;
    }

    this.alumnos = data.sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'persTapePaterno':
          return compare(a.persTapePaterno, b.persTapePaterno, isAsc);
        case 'tcolTdesc':
          return compare(a.tcolTdesc, b.tcolTdesc, isAsc);
        case 'coleTdesc':
          return compare(a.coleTdesc, b.coleTdesc, isAsc);
        case 'comuna':
          return compare(a.comuna, b.comuna, isAsc);
        case 'persNanoEgrMedia':
          return compare(a.persNanoEgrMedia, b.persNanoEgrMedia, isAsc);
        default: return 0;
      }
    });
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}