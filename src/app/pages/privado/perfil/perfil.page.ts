import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { PrincipalPage } from './principal/principal.page';

@Component({
  selector: 'app-perfil',
  template: '<ion-nav #nav></ion-nav>'
})
export class PerfilPage implements AfterViewInit {

  @ViewChild('nav') nav: IonNav | undefined;
  mostrarPin: boolean | undefined;

  async ngAfterViewInit() {
    await this.nav?.setRoot(PrincipalPage, { mostrarPin: this.mostrarPin === true });
  }

}
