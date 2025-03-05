import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { FolderContentPage } from './folder-content/folder-content.page';
import { InacapmailService } from 'src/app/core/services/inacapmail.service';
import { MensajeService } from 'src/app/core/components/mensaje/mensaje.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { EventsService } from 'src/app/core/services/events.services';
import { Subscription } from 'rxjs';
import { ErrorService } from 'src/app/core/services/error.service';
import { VISTAS_DOCENTE } from 'src/app/app.contants';

@Component({
  selector: 'app-inacapmail',
  templateUrl: './inacapmail.page.html',
  styleUrls: ['./inacapmail.page.scss'],
})
export class InacapmailPage implements OnInit, OnDestroy {

  @ViewChild('nav') nav: IonNav | undefined;

  folders: any;
  selectedFolder: any;
  eventSubscription!: Subscription;
  mostrarCargando = true;
  mostrarData = false;

  constructor(private api: InacapmailService,
    private mensaje: MensajeService,
    private snackbar: SnackbarService,
    private events: EventsService,
    private error: ErrorService) {

    this.eventSubscription = this.events.onEmailNotification.subscribe((event: any) => {
      if (event.action == 'delete' || event.action == 'markread') {
        this.recargar();
      }
    })

  }
  async ngOnInit() {
    await this.cargar();
    this.api.marcarVista(VISTAS_DOCENTE.MAIL);
  }
  ngOnDestroy() {
    this.eventSubscription.unsubscribe();
  }
  async cargar(forceRefresh = false) {
    try {
      const response = await this.api.getPrincipal(forceRefresh);
      const { data } = response;

      if (data.success) {
        const selectedFolder = data.folders.find((f: any) => f.isInbox);
        this.folders = data.folders;
        this.folderTap(selectedFolder);
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
  async recargar(ev?: any) {
    this.mostrarCargando = true;
    this.mostrarData = false;

    try {
      const response = await this.api.getPrincipal(true);
      const { data } = response;

      if (data.success) {
        if (this.selectedFolder) {
          data.folders.forEach((item: any) => item.selected = item.id == this.selectedFolder.id);
        }
        else {
          const selectedFolder = data.folders.find((f: any) => f.isInbox);
          this.folderTap(selectedFolder);
        }

        this.folders = [...data.folders];
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
      this.snackbar.showToast('No pudimos cargar la información. Vuelva a intentar.', 3000, 'danger');
    }
  }
  folderTap(folder: any) {
    this.selectedFolder = folder;
    this.folders.forEach((item: any) => item.selected = item.id == this.selectedFolder.id);
    this.nav?.setRoot(FolderContentPage, { folder: folder });
  }
  async correoTap() {
    try {
      await this.mensaje.crear();
    }
    catch (error: any) {
      this.snackbar.showToast('Ha ocurrido un error inesperado mientras se generaba el correo. Vuelva a intentar.');
    }
  }

}
