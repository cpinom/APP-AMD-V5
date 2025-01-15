import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { MessageContentPage } from '../message-content/message-content.page';
import { InacapmailService } from 'src/app/core/services/inacapmail.service';
import { EventsService } from 'src/app/core/services/events.services';
import { Subscription, forkJoin } from 'rxjs';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-folder-content',
  templateUrl: './folder-content.page.html',
  styleUrls: ['./folder-content.page.scss'],
})
export class FolderContentPage implements OnInit, OnDestroy {

  mostrarCargando = true;
  mostrarData = false;
  folder: any;
  messages: any;
  pageSize = 30;
  skip = 0;
  eventSubscription!: Subscription;
  modoEdicion = false;
  procesandoEliminar = false;

  constructor(private nav: IonNav,
    private api: InacapmailService,
    private events: EventsService,
    private snackbar: SnackbarService) {

    this.eventSubscription = this.events.onEmailNotification.subscribe((event: any) => {
      if (event.action == 'delete') {
        this.messages.forEach((item: any, index: number) => {
          if (item.id == event.id) {
            this.messages.splice(index, 1);
          }
        })
      }
      if (event.action == 'markread') {
        this.messages.forEach((item: any, index: number) => {
          if (item.id == event.id) {
            this.messages[index].isRead = true;
          }
        })
      }
    })

  }
  ngOnDestroy() {
    this.eventSubscription.unsubscribe();
  }
  ionViewDidEnter() {
    if (this.messages) {
      let messages = this.messages.filter((t: any) => t.isSelected);

      messages.forEach((message: any) => {
        message.isSelected = false;
      });
    }
  }
  async ngOnInit() {
    this.cargar();
  }
  async cargar(forceRefresh = false) {
    try {
      const params = {
        folderId: this.folder.id,
        pageSize: this.pageSize,
        skip: this.skip
      }
      const response = await this.api.getMessages(params, forceRefresh);
      const { data } = response;

      if (data.success) {
        if (!this.messages) {
          this.messages = data.messages;
        }
        else {
          this.messages = [...this.messages, ...data.messages];
        }
      }
      else {
        throw Error();
      }
    }
    catch (error: any) {
      this.snackbar.showToast('No se pudieron cargar los mensajes.');
    }
    finally {
      this.mostrarCargando = false;
      this.modoEdicion = false;
      this.procesandoEliminar = false;
      this.mostrarData = true;
    }
  }
  recargar() {
    this.mostrarCargando = true;
    this.mostrarData = false;
    this.cargar(true);
  }
  loadData(ev: any) {
    this.skip = this.pageSize + this.skip;
    this.cargar().finally(() => {
      ev.target.complete();
    });
  }
  messageTap(message: any) {
    if (this.modoEdicion) {
      return;
    }
    message.isSelected = true;
    this.nav.push(MessageContentPage, {
      message: message,
      messages: this.messages
    });
  }
  editarTap() {
    this.modoEdicion = true;
  }
  cancelarEditarTap() {
    this.modoEdicion = false;
    this.messages.forEach((element: any) => {
      element.isSelected = false;
    })
  }
  async eliminarTap() {
    const snackbar = await this.snackbar.create('Eliminando correos...', false, 'medium');
    let requests: any[] = [];
    let messages: string[] = [];

    this.messages.forEach((element: any) => {
      if (element.isSelected) {
        messages.push(element.id);
        requests.push(this.api.deleteMessage(element.id));
      }
    });

    this.procesandoEliminar = true;
    this.modoEdicion = false;

    snackbar.present();

    forkJoin(requests).subscribe((result) => {
      this.messages = this.messages.filter((element: any) => !element.isSelected);
      snackbar.dismiss();
      this.events.onEmailNotification.next({ action: 'delete' });
    });
  }
  get tieneSeleccion() {
    return this.messages && this.messages.filter((t: any) => t.isSelected).length;
  }
}
