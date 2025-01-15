import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonNav, LoadingController, ModalController } from '@ionic/angular';
import { RecuperacionesService } from 'src/app/core/services/curso/recuperaciones.service';
import * as moment from 'moment';
import { DisponibilidadPage } from '../disponibilidad/disponibilidad.page';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.page.html',
  styleUrls: ['./buscador.page.scss'],
})
export class BuscadorPage implements OnInit {

  data: any;
  mostrarFecha = false;
  form: FormGroup;
  fechaMinimaSolicitud: string;
  equipArray: string[] = [];
  submitted!: boolean;

  constructor(private modal: ModalController,
    private fb: FormBuilder,
    private api: RecuperacionesService,
    private alert: AlertController,
    private loading: LoadingController,
    private nav: IonNav) {

    this.form = this.fb.group({
      tsalCcod: [, Validators.required],
      lclaFclase: [, Validators.compose([
        Validators.required,
        Validators.pattern(/[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/)
      ])],
      fechaPicker: [],
      horaCcod: [, Validators.required],
      bloqueUnico: [false],
      equipamiento: [false]
    });

    this.fechaPicker?.valueChanges.subscribe((date) => {
      this.lclaFclase?.setValue(moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY'));
    });

    this.fechaPicker?.setValue(moment('07072022', 'DDMMYYYY').toISOString());
    this.fechaMinimaSolicitud = moment('07072022', 'DDMMYYYY').add('3', 'days').format('YYYY-MM-DD');

  }

  ngOnInit() { }
  async buscarBloques() {
    this.submitted = true;

    if (this.form.valid) {
      let loading = await this.loading.create({ message: 'Espere un momento...' });
      let result: any;
      let params = {
        sedeCcod: this.seccion.sedeCcod,
        lclaNcorr: this.clase.lclaNcorr,
        horaCcod: this.horaCcod?.value,
        lclaFclase: this.lclaFclase?.value,
        bloqueUnico: this.bloqueUnico?.value ? 1 : 0,
        seccCcod: this.clase.seccCcod,
        tsalCcod: this.tsalCcod?.value
      };

      await loading.present();

      try {
        result = await this.api.getHorariosDisponibles(params);
      }
      finally {
        await loading.dismiss();
      }

      const { data } = result;

      if (data.success) {
        await this.nav.push(DisponibilidadPage, {
          bloques: data.bloques,
          data: {
            lclaNcorr: this.clase.lclaNcorr,
            horaCcod: this.horaCcod?.value,
            lclaFclase: this.lclaFclase?.value,
            tsalCcod: this.tsalCcod?.value,
            equipTdesc: this.equipamiento?.value ? this.equipArray.join(', ') : '',
            seccion: this.data.seccion
          }
        });
      } else {
        this.mostrarAlerta(data.message);
      }
    }
  }
  async mostrarAlerta(mensaje: string) {
    const alert = await this.alert.create({
      header: 'Solicitud Recuperación',
      message: mensaje,
      buttons: [
        {
          text: 'Cerrar'
        }
      ]
    });
    await alert.present();
  }
  validaDiaDomingo = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0;
  }
  getEquipamiento(e: any, equipo: string) {
    let detail = e.detail.checked;

    if (detail) {
      this.equipArray.push(equipo);
    } else {
      let itemIndex!: number;
      this.equipArray.forEach((item, index) => {
        if (item === equipo) {
          itemIndex = index;
        }
      });
      delete this.equipArray[itemIndex];
      const filtered = this.equipArray.filter(function (el) {
        return el != null;
      });
      this.equipArray = filtered;
    }
  }
  async cerrar() {
    await this.modal.dismiss();
  }
  get seccion() {
    if (this.data) return this.data.seccion;
    return null;
  }
  get clase() {
    if (this.data) return this.data.clase;
    return null;
  }
  get tsalCcod() { return this.form.get('tsalCcod'); }
  get lclaFclase() { return this.form.get('lclaFclase'); }
  get fechaPicker() { return this.form.get('fechaPicker'); }
  get horaCcod() { return this.form.get('horaCcod'); }
  get bloqueUnico() { return this.form.get('bloqueUnico'); }
  get equipamiento() { return this.form.get('equipamiento') };

}
