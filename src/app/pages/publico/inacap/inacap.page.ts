import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/core/services/events.services';
import { PublicoService } from 'src/app/core/services/publico.service';
import { UtilsService } from 'src/app/core/services/utils.service';

enum Institucion {
  cft = 0,
  ip = 1,
  universidad = 2,
  educacion_continua = 4
};

@Component({
  selector: 'app-inacap',
  templateUrl: './inacap.page.html',
  styleUrls: ['./inacap.page.scss'],
})
export class InacapPage implements OnInit, OnDestroy {

  @ViewChild(IonContent) content: IonContent | undefined;
  mostrarCargando = true;
  mostrarData = false;
  mostrarMas = false;
  data: any;
  subscription: Subscription;

  constructor(private api: PublicoService,
    private utils: UtilsService,
    private events: EventsService) {

    this.subscription = this.events.app.subscribe((event: any) => {
      if (event.action == 'scrollTop' && event.index == 1) {
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
      const response = await this.api.getInacap();
      const { data } = response;

      this.data = data;
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
  abrirInstituciones(inst: Institucion) {
    if (inst == Institucion.cft) {
      this.utils.openLink('https://portales.inacap.cl/sobre-nosotros/cft/index');
    }
    else if (inst == Institucion.ip) {
      this.utils.openLink('https://portales.inacap.cl/sobre-nosotros/ip/index');
    }
    else if (inst == Institucion.universidad) {
      this.utils.openLink('https://portales.inacap.cl/sobre-nosotros/universidad/index');
    }
    else if (inst == Institucion.educacion_continua) {
      this.utils.openLink('https://portales.inacap.cl/educacion-continua/index');
    }
  }
  abrirRevista() {
    this.utils.openLink(this.data.appuTlink);
  }
  abrirMaterial() {
    this.utils.openLink('https://portales.inacap.cl/estudiantes/recursos/reglamentos-y-politicas/index');
  }

}
