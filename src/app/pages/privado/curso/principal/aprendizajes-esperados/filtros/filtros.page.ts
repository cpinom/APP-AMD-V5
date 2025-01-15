import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-filtros',
  templateUrl: './filtros.page.html',
  styleUrls: ['./filtros.page.scss'],
})
export class FiltrosPage implements OnInit {

  codClase = 0;
  codVisto = 0;
  lclaFclase!: string;
  clases: any;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }
  async buscar() {
    await this.modalCtrl.dismiss({
      codClase: this.codClase,
      codVisto: this.codVisto,
      lclaFclase: this.lclaFclase
    });
  }
  async cerrar() {
    await this.modalCtrl.dismiss();
  }

}
