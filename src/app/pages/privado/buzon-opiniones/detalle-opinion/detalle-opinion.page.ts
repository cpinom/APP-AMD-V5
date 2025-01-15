import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BuzonopinionService } from 'src/app/core/services/buzonopinion.service';
import { ErrorService } from 'src/app/core/services/error.service';

@Component({
  selector: 'app-detalle-opinion',
  templateUrl: './detalle-opinion.page.html',
  styleUrls: ['./detalle-opinion.page.scss'],
})
export class DetalleOpinionPage implements OnInit {

  tipoUsuario!: string;
  resoNcorr!: string;
  data: any;
  esreTdesc = {
    'color': '',
    'icon': ''
  };

  constructor(private api: BuzonopinionService,
    private modalCtrl: ModalController,
    private error: ErrorService) { }

  async ngOnInit() {
    await this.cargar();
  }
  async cargar() {
    try {
      const params = { resoNcorr: this.resoNcorr, tuserCcod: this.tipoUsuario };
      const response = await this.api.getDetalleOpinion(params);
      const { data } = response;

      if (data.success) {
        data.data.resoTsugerencia = data.data.resoTsugerencia.replace(/(?:\r\n|\r|\n)/g, '<br>');
        data.data.resoTrespuesta = data.data.resoTrespuesta ? data.data.resoTrespuesta.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';

        this.data = data.data;
        this.resolverEstado();
      }
      else {
        throw Error();
      }
    }
    catch (error) {
      this.error.handle(error);
    }
  }
  resolverEstado() {
    switch (this.data.esreTdesc) {
      case 'Finalizado':
      case 'Cerrado':
        this.esreTdesc.color = 'success';
        this.esreTdesc.icon = 'check_circle';
        break;
      case 'Abierto':
        this.esreTdesc.color = 'warning';
        this.esreTdesc.icon = 'schedule';
        break;
    }

    return '';
  }
  cerrar() {
    this.modalCtrl.dismiss();
  }

}
