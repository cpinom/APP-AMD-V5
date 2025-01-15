import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { AppGlobal } from 'src/app/app.global';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { ErrorService } from 'src/app/core/services/error.service';

@Component({
  selector: 'app-asignaturas-prerequisitos',
  templateUrl: './asignaturas-prerequisitos.page.html',
  styleUrls: ['./asignaturas-prerequisitos.page.scss'],
})
export class AsignaturasPrerequisitosPage implements OnInit {

  data: any;
  planes: any;
  mostrarCargando = true;
  mostrarData = false;

  constructor(private api: CursoService,
    private global: AppGlobal,
    private error: ErrorService) { }

  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.data = JSON.parse(result.value!);
      this.cargar();
    });

    this.api.marcarVista(VISTAS_DOCENTE.WIDGET_PREREQUISITOS);
  }
  async cargar(forceRefresh = false) {
    try {
      const params = {
        asigCcod: this.data.asigCcod,
        seccCcod: this.data.seccCcod,
        ssecNcorr: this.data.ssecNcorr
      };
      const response = await this.api.getPrerequisitosDetalle(params, forceRefresh);
      const { data } = response;

      if (data.success) {
        this.planes = data.planes;
      }
      else {
        throw Error(data.message);
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
      ev.target.complete();
    });
  }
  resolverFoto(persNcorr: any) {
    return `${this.global.Api}/api/v4/avatar/${persNcorr}`;
  }
  redondear(value: number) {
    return value.toFixed(1)
  }

}
