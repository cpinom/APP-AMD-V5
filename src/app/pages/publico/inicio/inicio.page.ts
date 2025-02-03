import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular';
import { InformacionPage } from '../informacion/informacion.page';
import { PublicoService } from 'src/app/core/services/publico.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { EventsService } from 'src/app/core/services/events.services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit, OnDestroy {

  @ViewChild(IonContent) content: IonContent | undefined;
  mostrarCargando = true;
  mostrarData = false;
  noticias: any;
  contacto: any;
  subscription: Subscription;

  constructor(private modalCtrl: ModalController,
    private api: PublicoService,
    private utils: UtilsService,
    private events: EventsService) {

    this.subscription = this.events.app.subscribe((event: any) => {
      if (event.action == 'scrollTop' && event.index == 0) {
        this.content?.scrollToTop(500);
      }
    });

  }

  async ngOnInit() {
    await this.cargar();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  async cargar() {
    try {
      const response = await this.api.getPrincipal();
      const { data } = response;

      if (data.success) {
        this.noticias = data.noticias;
        this.contacto = data.contacto;
      }
      else {
        throw Error();
      }
    }
    catch (error: any) { }
    finally {
      this.mostrarCargando = false;
      this.mostrarData = true;
    }
  }
  recargar(e?: any) {
    this.mostrarCargando = true;
    this.mostrarData = false;
    this.cargar().finally(() => {
      e && e.target.complete();
    });
  }
  resolverFecha(fecha: string) {
    return this.utils.resolveDate(fecha, 'DD/MM/YYYY HH:mm');
  }
  async mostrarLink(url: string) {
    await this.utils.openLink(url);
  }
  async infoTap() {
    const infoMdl = await this.modalCtrl.create({
      component: InformacionPage
    });

    await infoMdl.present();
  }

}
