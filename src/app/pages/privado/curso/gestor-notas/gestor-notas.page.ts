import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { EvaluacionesPage } from './evaluaciones/evaluaciones.page';

@Component({
  selector: 'app-gestor-notas',
  template: '<ion-nav #nav></ion-nav>'
})
export class GestorNotasPage implements AfterViewInit {

  @ViewChild('nav') nav!: IonNav;

  constructor() { }

  async ngAfterViewInit() {
    await this.nav.setRoot(EvaluacionesPage);
  }
}
