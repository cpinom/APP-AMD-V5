import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { ResumenPage } from './resumen/resumen.page';

@Component({
  selector: 'app-principal',
  template: '<ion-nav #nav></ion-nav>'
})
export class PrincipalPage implements AfterViewInit {

  @ViewChild('nav') nav!: IonNav;

  constructor() { }

  async ngAfterViewInit() {
    await this.nav.setRoot(ResumenPage);
  }

}
