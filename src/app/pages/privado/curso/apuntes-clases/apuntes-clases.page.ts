import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { PrincipalPage } from './principal/principal.page';

@Component({
  selector: 'app-apuntes-clases',
  template: '<ion-nav #nav></ion-nav>'
})
export class ApuntesClasesPage implements AfterViewInit {

  @ViewChild('nav') nav!: IonNav;

  constructor() { }

  async ngAfterViewInit() {
    await this.nav.setRoot(PrincipalPage);
  }
  
}
