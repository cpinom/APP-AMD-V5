import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { AppGlobal } from '../../../../../app.global';
import { VISTAS_DOCENTE } from 'src/app/app.contants';

@Component({
  selector: 'app-distribucion-notas',
  templateUrl: './distribucion-notas.page.html',
  styleUrls: ['./distribucion-notas.page.scss'],
})
export class DistribucionNotasPage implements OnInit {

  seccion: any;
  alumnos: any;
  ponderaciones: any;
  mostrarCargando = true;
  mostrarData = false;

  constructor(private api: CursoService,
    private error: ErrorService,
    private global: AppGlobal) { }

  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.seccion = JSON.parse(result.value!);
      this.cargar();
    });

    this.api.marcarVista(VISTAS_DOCENTE.WIDGET_NOTAS);
  }
  async cargar(forceRefresh = false) {
    try {
      const params = {
        seccCcod: this.seccion.seccCcod,
        ssecNcorr: this.seccion.ssecNcorr
      };
      const response = await this.api.getDistribucionNotas(params, forceRefresh);
      const { data } = response;

      if (data.success) {
        this.ponderaciones = data.ponderaciones;
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
  recargar(ev?: any) {
    this.cargar(true).finally(() => {
      ev && ev.target.complete();
    });
  }
  resolverFoto(persNcorr: any) {
    return `${this.global.Api}/api/v4/avatar/${persNcorr}`;
  }
  resolverCssNota(calaNnota: string) {
    const isDefined = calaNnota && calaNnota.length;
    const isNumeric = isDefined ? !isNaN(Number(calaNnota[0])) : false;

    if (isNumeric) {
      const nota = parseInt(calaNnota);

      if (nota < 4) {
        return 'rojo'
      };
    }

    return '';
  }

}
