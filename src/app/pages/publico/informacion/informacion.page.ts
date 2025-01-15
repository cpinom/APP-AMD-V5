import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { PrincipalPage } from './principal/principal.page';

@Component({
  selector: 'app-informacion',
  template: '<ion-nav #nav></ion-nav>'
})
export class InformacionPage implements AfterViewInit {

  @ViewChild('nav') nav: IonNav | undefined;

  constructor() { }

  async ngAfterViewInit() {
    await this.nav?.setRoot(PrincipalPage);
  }

}
