import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-compartir',
  templateUrl: './compartir.page.html',
  styleUrls: ['./compartir.page.scss'],
})
export class CompartirPage implements OnInit {

  data: any;

  constructor(private modal: ModalController) { }

  ngOnInit() {
  }
  compartir() {    
  }
  async cerrar() {
    await this.modal.dismiss();
  }

}
