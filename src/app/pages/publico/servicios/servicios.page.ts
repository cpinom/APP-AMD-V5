import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/core/services/events.services';
import { PublicoService } from 'src/app/core/services/publico.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { InformacionPage } from '../informacion/informacion.page';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
})
export class ServiciosPage implements OnInit, OnDestroy {

  @ViewChild(IonContent) content: IonContent | undefined;
  subscription: Subscription;
  data: any;
  mostrarData = false;
  mostrarCargando = true;

  constructor(private api: PublicoService,
    private events: EventsService,
    private utils: UtilsService,
    private modalCtrl: ModalController) {

    this.subscription = this.events.app.subscribe((event: any) => {
      if (event.action == 'scrollTop' && event.index == 4) {
        this.content?.scrollToTop(500);
      }
    });
  }
  ngOnInit() {
    this.cargar();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  async cargar() {
    try {
      const response = await this.api.getContacto();
      const { data } = response;

      if (data.success) {
        this.data = data.contacto;
      }
      else {
        throw Error();
      }
    }
    catch (error: any) { }
    finally {
      this.mostrarData = true;
      this.mostrarCargando = false;
    }
  }
  recargar() {
    this.mostrarCargando = true;
    this.mostrarData = false;
    this.cargar();
  }
  serviciosTecnologicosTap() {
    this.utils.openLink(this.data.urlServiciosTecnologicos);
  }
  async versionTap() {
    const modal = await this.modalCtrl.create({
      component: InformacionPage
    });

    await modal.present();
  }
  abrirNavegador(url: string) {
    this.utils.openLink(this.data[url]);
  }

}
