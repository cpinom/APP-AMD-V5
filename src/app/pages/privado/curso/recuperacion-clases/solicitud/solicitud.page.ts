import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { BuscadorPage } from './buscador/buscador.page';

@Component({
  selector: 'app-solicitud',
  template: '<ion-nav #nav></ion-nav>'
})
export class SolicitudPage implements AfterViewInit {

  @ViewChild('nav') nav!: IonNav;
  data: any;

  constructor() { }

  async ngAfterViewInit() {
    await this.nav.setRoot(BuscadorPage, { data: this.data });
  }

}
