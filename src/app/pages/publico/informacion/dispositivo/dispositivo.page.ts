import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { PinPage } from './pin/pin.page';

@Component({
  selector: 'app-dispositivo',
  template: '<ion-nav #nav></ion-nav>'
})
export class DispositivoPage implements AfterViewInit {

  @ViewChild('nav') nav: IonNav | undefined;

  constructor() { }

  async ngAfterViewInit() {
    await this.nav?.setRoot(PinPage);
  }

}
