import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss']
})
export class ImageModalComponent implements OnInit {

  @Input() src!: string;
  @Input() title!: string;

  constructor(private modalCtrl: ModalController) { }
  ngOnInit() { }
  async cerrar() {
    await this.modalCtrl.dismiss();
  }

}
