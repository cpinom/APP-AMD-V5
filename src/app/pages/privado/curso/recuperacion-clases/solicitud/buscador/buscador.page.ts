import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonNav, Platform } from '@ionic/angular';
import { RecuperacionesService } from 'src/app/core/services/curso/recuperaciones.service';
import { DisponibilidadPage } from '../disponibilidad/disponibilidad.page';
import { DialogService } from 'src/app/core/services/dialog.service';
import * as moment from 'moment';
import { EstudiantesPage } from '../estudiantes/estudiantes.page';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.page.html',
  styleUrls: ['./buscador.page.scss']
})
export class BuscadorPage implements OnInit {

  data: any;
  mostrarFecha = false;
  form: FormGroup;
  fechaMinimaSolicitud: string | undefined;
  equipArray: string[] = [];
  submitted!: boolean;

  loading: HTMLIonLoadingElement | null = null;
  cancelAlert: HTMLIonAlertElement | null = null;
  updateMessageTimeout: any;
  cancelOptionTimeout: any;
  searchInProgress: boolean = false;
  isCancelled: boolean = false; // Marca de cancelación

  constructor(private fb: FormBuilder,
    private api: RecuperacionesService,
    private dialog: DialogService,
    private nav: IonNav,
    private pt: Platform) {

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

    if (this.pt.is('mobileweb')) {
      const fechaActual = moment('20042024', 'DDMMYYYY');
      this.fechaPicker?.setValue(fechaActual.toISOString());
      this.fechaMinimaSolicitud = fechaActual.add('3', 'days').format('YYYY-MM-DD');
    }
    else {
      this.fechaPicker?.setValue(moment().toISOString());
      this.fechaMinimaSolicitud = moment().add('3', 'days').format('YYYY-MM-DD');
    }
  }

  ngOnInit() {
    const aula = this.data.tiposSalas.find((item: any) => item.tsalCcod == 1);

    if (aula) {
      this.tsalCcod?.setValue(aula.tsalCcod);
    }
  }
  async buscarBloques() {
    this.submitted = true;
    this.isCancelled = false;

    if (this.form.valid) {

      this.searchInProgress = true; // Indicar que la búsqueda está en curso
      this.loading = await this.dialog.showLoading({ message: 'Buscando disponibilidad...' });

      const params = {
        sedeCcod: this.seccion.sedeCcod,
        lclaNcorr: this.clase.detalle.libro,
        horaCcod: this.horaCcod?.value,
        lclaFclase: this.lclaFclase?.value,
        bloqueUnico: this.bloqueUnico?.value ? 1 : 0,
        seccCcod: this.clase.seccCcod,
        tsalCcod: this.tsalCcod?.value
      };

      // Temporizador para cambiar el mensaje si tarda más de 10 segundos
      this.updateMessageTimeout = setTimeout(() => {
        if (this.loading) {
          this.loading.message = 'Verificando espacios disponibles... Gracias por tu paciencia.';
        }
      }, 10000);

      // Mostrar opción de cancelar después de 15 segundos
      this.cancelOptionTimeout = setTimeout(async () => {
        if (this.searchInProgress) {
          if (this.loading) {
            await this.loading.dismiss();
            this.loading = null;
          }

          this.cancelAlert = await this.dialog.showAlert({
            header: '¿Cancelar búsqueda?',
            message: 'La búsqueda está tardando más de lo esperado. ¿Desea cancelarla?',
            buttons: [
              {
                text: 'Seguir esperando',
                role: 'cancel',
                handler: async () => {
                  if (this.searchInProgress) {
                    this.loading = await this.dialog.showLoading({ message: 'Seguimos buscando...' });
                  }
                }
              },
              {
                text: 'Cancelar búsqueda',
                role: 'destructive',
                handler: () => {
                  this.cancelarBusqueda();
                }
              }
            ]
          });
        }

      }, 25000);

      let result: any;

      try {
        result = await this.api.getHorariosDisponiblesV5(params);

        // Si se cancela la resuesta es ignorada
        if (this.isCancelled) {
          return;
        }
      }
      finally {
        this.finalizarBusqueda();
      }

      const { data } = result;

      if (data.success) {
        await this.nav.push(DisponibilidadPage, {
          bloques: data.bloques,
          data: {
            lclaNcorr: this.clase.detalle.libro,
            horaCcod: this.horaCcod?.value,
            lclaFclase: this.lclaFclase?.value,
            tsalCcod: this.tsalCcod?.value,
            equipTdesc: this.equipamiento?.value ? this.equipArray.join(', ') : '',
            seccion: this.data.seccion
          }
        });
      }
      else if (data.alumnos && data.alumnos.length) {
        await this.nav.push(EstudiantesPage, { alumnos: data.alumnos });
      }
      else {
        await this.presentError(data.message);
      }
    }
  }
  async finalizarBusqueda() {
    this.searchInProgress = false;

    // Cerrar el loading si sigue abierto
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }

    // Cerrar la alerta si está abierta
    if (this.cancelAlert) {
      await this.cancelAlert.dismiss();
      this.cancelAlert = null;
    }

    clearTimeout(this.updateMessageTimeout);
    clearTimeout(this.cancelOptionTimeout);
  }
  async cancelarBusqueda() {
    this.isCancelled = true; // Marcar que la búsqueda fue cancelada
    this.searchInProgress = false; // Marcar que la búsqueda fue cancelada

    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }

    if (this.cancelAlert) {
      await this.cancelAlert.dismiss();
      this.cancelAlert = null;
    }

    clearTimeout(this.updateMessageTimeout);
    clearTimeout(this.cancelOptionTimeout);
  }
  async presentError(message: string) {
    const alert = await this.dialog.showAlert({
      cssClass: 'alert-message',
      message: `<img src="./assets/images/warning.svg" /><br />${message}`,
      header: 'Solicitud Recuperación',
      buttons: ['Aceptar']
    });

    return alert;
  }
  validaDiaDomingo = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0;
  }
  getEquipamiento(e: any, equipo: string) {
    const detail = e.detail.checked;

    if (detail) {
      this.equipArray.push(equipo);
    }
    else {
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
    await this.dialog.dismissModal();
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
