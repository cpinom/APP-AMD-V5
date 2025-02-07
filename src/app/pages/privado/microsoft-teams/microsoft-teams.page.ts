import { Component, OnInit, ViewChild } from '@angular/core';
import { AppLauncher } from '@capacitor/app-launcher';
import { IonInfiniteScroll, IonPopover } from '@ionic/angular';
import * as moment from 'moment';
import { ErrorService } from 'src/app/core/services/error.service';
import { MicrosoftTeamsService } from 'src/app/core/services/microsoft-teams.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { UtilsService } from 'src/app/core/services/utils.service';
// import { Share } from '@capacitor/share';
import { VISTAS_DOCENTE } from 'src/app/app.contants';

@Component({
  selector: 'app-microsoft-teams',
  templateUrl: './microsoft-teams.page.html',
  styleUrls: ['./microsoft-teams.page.scss'],
})
export class MicrosoftTeamsPage implements OnInit {

  @ViewChild(IonInfiniteScroll) infiniteItem!: IonInfiniteScroll;
  @ViewChild('popover') popover!: IonPopover;
  mostrarCargando = true;
  mostrarData = false;
  eventos: any;
  evento: any;
  isOpen = false;
  pageSize = 30;
  skip = 0;

  constructor(private api: MicrosoftTeamsService,
    private error: ErrorService,
    private utils: UtilsService,
    private snackbar: SnackbarService) {
    moment.locale('es');
  }
  ngOnInit() {
    this.cargar();
    this.api.marcarVista(VISTAS_DOCENTE.TEAMS);
  }
  async cargar() {
    try {
      const response = await this.api.getEventosV3(this.pageSize, this.skip);
      const { data } = response;
      
      if (data.success) {
        if (!this.eventos) {
          this.eventos = data.eventos;
        }
        else {
          this.eventos = [...this.eventos, ...data.eventos];
        }

        if (this.infiniteItem) {
          this.infiniteItem.disabled = !(data.eventos.length == this.pageSize);
        }
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
  loadData(ev: any) {
    this.skip = this.pageSize + this.skip;
    this.cargar().finally(() => {
      ev.target.complete();
    });
  }
  recargar(ev?: any) {
    if (this.infiniteItem) {
      this.infiniteItem.disabled = false;
    }
    
    this.mostrarData = false;
    this.cargar().finally(() => {
      ev && ev.target.complete();
    });
  }
  async detalleTap(evento: any, ev: any) {
    this.evento = evento;
    this.popover.event = ev;
    this.isOpen = true;
  }
  async unirseTap(evento: any, ev: any) {
    ev.stopPropagation();

    const appUrl = evento.url;

    try {
      await AppLauncher.openUrl({ url: appUrl });
    }
    catch {
      await this.utils.openLink(appUrl);
    }
  }
  async compartirTap() {
    // await Share.share({
    //   url: this.evento.url
    // });
  }
  async eliminarTap() {
    const snackbar = await this.snackbar.create('Eliminando...', false, 'medium');

    await snackbar.present();

    try {
      await this.api.eliminarEvento({ id: this.evento.id });
      this.isOpen = false;
      this.recargar();
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
        return;
      }

      this.snackbar.showToast('No pudimos procesar su solicitud. Vuelva a intentar.', 3000, 'danger');
    }
    finally {
      snackbar.dismiss();
    }
  }
  resolverFechaEvento(fecha: any) {
    return moment(fecha.inicio).format('dddd, DD [de] MMMM [de] YYYY')
  }
  resolverHoraEvento(fecha: any) {
    return moment(fecha.inicio).format('HH:mm') + ' - ' + moment(fecha.fin).format('HH:mm')
  }
  resolverFecha(fecha: any) {
    return moment(fecha.inicio).format('DD/MM/YYYY') + ' ' + moment(fecha.inicio).format('HH:mm') + ' - ' + moment(fecha.fin).format('HH:mm');
  }

}
