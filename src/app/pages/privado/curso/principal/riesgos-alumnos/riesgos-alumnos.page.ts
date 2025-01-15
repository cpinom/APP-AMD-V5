import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { AppGlobal } from '../../../../../app.global';
import { ErrorService } from 'src/app/core/services/error.service';
import { VISTAS_DOCENTE } from 'src/app/app.contants';

enum Filtro {
  todos = 1,
  sin_riesgos = 2,
  riesgos_asistencia = 3,
  riesgos_nota = 4,
  riesgos_nota_asistencia = 5,
  reprobado_asistencia = 6,
  reprobado_nota = 7
};

@Component({
  selector: 'app-riesgos-alumnos',
  templateUrl: './riesgos-alumnos.page.html',
  styleUrls: ['./riesgos-alumnos.page.scss'],
})
export class RiesgosAlumnosPage implements OnInit {

  seccion: any;
  alumnos: any;
  alumnosFiltrados: any;
  mostrarCargando = true;
  mostrarData = false;
  filtro = Filtro.todos;

  constructor(private api: CursoService,
    private global: AppGlobal,
    private error: ErrorService) { }
  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.seccion = JSON.parse(result.value!);
      this.cargar();
    });

    this.api.marcarVista(VISTAS_DOCENTE.WIDGET_RIESGOS);
  }
  async cargar(forceRefresh = false) {
    try {
      const params = {
        periCcod: this.seccion.periCcod,
        seccCcod: this.seccion.seccCcod,
        ssecNcorr: this.seccion.ssecNcorr
      };
      const response = await this.api.getRiesgosEstudiantes(params, forceRefresh);
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
  recargar(ev: any) {
    this.cargar(true).finally(() => {
      ev.target.complete();
    })
  }
  resolverFoto(persNcorr: any) {
    return `${this.global.Api}/api/v4/avatar/${persNcorr}`;
  }
  resolverCss(alnoCriesgoAlumno: string) {
    if (alnoCriesgoAlumno == 'Sin Riesgo') return 'verde';
    if (alnoCriesgoAlumno == 'Riesgo Asistencia') return 'naranjo';
    if (alnoCriesgoAlumno == 'Riesgo Nota') return 'naranjo';
    if (alnoCriesgoAlumno == 'Reprobado Asistencia' || alnoCriesgoAlumno == 'Reprobado Nota') return 'rojo';
    return '';
  }
  resolverColor(filtro: Filtro) {
    return (filtro == this.filtro) ? 'info' : 'secondary';
  }
  aplicarFiltro(filtro: Filtro) {
    this.filtro = filtro;

    if (this.filtro == Filtro.todos) {
      this.alumnosFiltrados = this.alumnos;
    }
    if (filtro == Filtro.sin_riesgos) {
      this.alumnosFiltrados = this.alumnos.filter((t: any) => t.alnoCriesgoAlumno == 'Sin Riesgo');
    }
    if (filtro == Filtro.riesgos_asistencia) {
      this.alumnosFiltrados = this.alumnos.filter((t: any) => t.alnoCriesgoAlumno == 'Riesgo Asistencia');
    }
    if (filtro == Filtro.riesgos_nota) {
      this.alumnosFiltrados = this.alumnos.filter((t: any) => t.alnoCriesgoAlumno == 'Riesgo Nota');
    }
    if (filtro == Filtro.riesgos_nota_asistencia) {
      this.alumnosFiltrados = this.alumnos.filter((t: any) => t.alnoCriesgoAlumno == 'R.Nota y Asistencia');
    }
    if (filtro == Filtro.reprobado_asistencia) {
      this.alumnosFiltrados = this.alumnos.filter((t: any) => t.alnoCriesgoAlumno == 'Reprobado Asistencia');
    }
    if (filtro == Filtro.reprobado_nota) {
      this.alumnosFiltrados = this.alumnos.filter((t: any) => t.alnoCriesgoAlumno == 'Reprobado Nota');
    }

  }
  resolverContador(filtro: Filtro) {
    if (filtro == Filtro.todos) {
      return 'Todos' + (this.alumnos ? ' (' + this.alumnos.length + ')' : '');
    }
    if (filtro == Filtro.sin_riesgos) {
      return 'Sin Riesgos' + (this.alumnos ? ' (' + this.alumnos.filter((t: any) => t.alnoCriesgoAlumno == 'Sin Riesgo').length + ')' : '');
    }
    if (filtro == Filtro.riesgos_asistencia) {
      return 'Riesgos Asistencia' + (this.alumnos ? ' (' + this.alumnos.filter((t: any) => t.alnoCriesgoAlumno == 'Riesgo Asistencia').length + ')' : '');
    }
    if (filtro == Filtro.riesgos_nota) {
      return 'Riesgos Notas' + (this.alumnos ? ' (' + this.alumnos.filter((t: any) => t.alnoCriesgoAlumno == 'Riesgo Nota').length + ')' : '');
    }
    if (filtro == Filtro.riesgos_nota_asistencia) {
      return 'Riesgos Nota/Asist.' + (this.alumnos ? ' (' + this.alumnos.filter((t: any) => t.alnoCriesgoAlumno == 'R.Nota y Asistencia').length + ')' : '');
    }
    if (filtro == Filtro.reprobado_asistencia) {
      return 'Reprobados Asistencia' + (this.alumnos ? ' (' + this.alumnos.filter((t: any) => t.alnoCriesgoAlumno == 'Reprobado Asistencia').length + ')' : '');
    }
    if (filtro == Filtro.reprobado_nota) {
      return 'Reprobados Notas' + (this.alumnos ? ' (' + this.alumnos.filter((t: any) => t.alnoCriesgoAlumno == 'Reprobado Nota').length + ')' : '');
    }
    return '';
  }

}
