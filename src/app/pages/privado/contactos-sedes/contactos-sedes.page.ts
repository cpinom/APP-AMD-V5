import { Component, OnInit } from '@angular/core';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { AppGlobal } from '../../../app.global';
import { MensajeService } from 'src/app/core/components/mensaje/mensaje.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { VISTAS_DOCENTE } from 'src/app/app.contants';

@Component({
  selector: 'app-contactos-sedes',
  templateUrl: './contactos-sedes.page.html',
  styleUrls: ['./contactos-sedes.page.scss'],
})
export class ContactosSedesPage implements OnInit {

  mostrarCargando = true;
  mostrarData = false;
  sedes: any;

  constructor(private api: CursoService,
    private error: ErrorService,
    private global: AppGlobal,
    private mensaje: MensajeService,
    private snackbar: SnackbarService) { }

  async ngOnInit() {
    await this.cargar();
    this.api.marcarVista(VISTAS_DOCENTE.CONTACTOS_SEDES);
  }
  async cargar() {
    try {
      const response = await this.api.getContactosSedes();
      const { data } = response;

      if (data.success) {
        this.sedes = data.sedes;
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
  resolverFoto(persNcorr: any) {
    return `${this.global.Api}/api/v4/avatar/${persNcorr}`;
  }
  async correo(correo: string) {
    try {
      await this.mensaje.crear(correo);
    }
    catch {
      this.snackbar.showToast('Ha ocurrido un error inesperado mientras se generaba el correo. Vuelva a intentar.');
    }
  }

}
