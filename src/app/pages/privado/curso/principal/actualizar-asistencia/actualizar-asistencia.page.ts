import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { IonNav } from "@ionic/angular";
import { PrincipalPage } from "./principal/principal.page";

@Component({
  selector: 'app-actualizar-asistencia',
  template: '<ion-nav #nav></ion-nav>'
})
export class ActualizarAsistenciaPage implements AfterViewInit {

  @ViewChild('nav') nav: IonNav | undefined;

  constructor() { }

  async ngAfterViewInit() {
    await this.nav?.setRoot(PrincipalPage);
  }

}