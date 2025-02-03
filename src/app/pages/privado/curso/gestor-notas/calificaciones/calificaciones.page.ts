import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { EvaluacionesService } from 'src/app/core/services/curso/evaluaciones.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { AppGlobal } from '../../../../../app.global';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { AutenticacionPage } from './autenticacion/autenticacion.page';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import * as moment from 'moment';

@Component({
  selector: 'app-calificaciones',
  templateUrl: './calificaciones.page.html',
  styleUrls: ['./calificaciones.page.scss'],
})
export class CalificacionesPage implements OnInit {

  seccion: any;
  evaluacion: any;
  notas: any;
  mostrarCargando = true;
  mostrarData = false;

  notasForm!: FormGroup;
  //deshabilitarGuardar = false;

  constructor(private api: EvaluacionesService,
    private error: ErrorService,
    private global: AppGlobal,
    private fb: FormBuilder,
    private snackbar: SnackbarService,
    private alertCtrl: AlertController,
    private loading: LoadingController,
    private modalCtrl: ModalController) {

    this.notasForm = this.fb.group({
      notas: new FormArray([])
    });
  }
  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.seccion = JSON.parse(result.value!);
      this.cargar();
    })
  }
  async cargar() {
    if (this.evaluacion.evaluacionPendiente) {
      this.presentAlert('Posee una evaluación previa pendiente por ingresar.');
    }
    if (this.evaluacion.evaluacionCierre) {
    }
    try {
      const params = {
        caliNcorr: this.evaluacion.caliNcorr,
        seccCcod: this.seccion.seccCcod,
        asigCcod: this.seccion.asigCcod
      }
      const response = await this.api.getNotasEvaluacion(params);
      const { data } = response;

      if (data.success) {
        this.notas = data.alumnos;
        this.procesarNotas();
      }
      else {
        throw Error();
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
        return;
      }
    }
    finally {
      this.mostrarCargando = false;
      this.mostrarData = true;
    }
  }
  procesarNotas() {
    let formArray: FormArray = this.notasForm.get('notas') as FormArray;

    formArray.clear();

    this.notas.forEach((item: any, index: number) => {
      let disabled = this.resolverBloquearNota(item);
      let notaControl = this.fb.group({
        nota: [
          { value: item.calaNnota, disabled: disabled },
          Validators.compose([Validators.required, NotaValidator])
        ]
      });

      formArray.push(notaControl)
    })
  }
  async guardar() {

    if (this.notasForm.valid) {
      const loading = await this.loading.create({ message: 'Procesando...' });
      const notas = this.notasForm.getRawValue()['notas'] as any[];
      let alumnos: any[] = [];
      let contadorNoValidas = 0;

      notas.forEach((item, index) => {
        const alumno = this.notas[index];

        if (parseFloat(item.nota) == 1) {
          contadorNoValidas++;
        }

        if (parseFloat(item.nota) > 0 && alumno.vfecha == 1) {
          alumnos.push({
            matrNcorr: alumno.matrNcorr,
            calaNnota: item.nota.replace(',', '.'),
            caliNjustificacion: 0
          });
        }
      });

      if (contadorNoValidas == notas.length) {
        let confirmaGuardar = await this.presentConfirm('Todas las notas ingresadas tienen un "1". ¿Realmente desea guardar?');

        if (!confirmaGuardar) {
          return;
        }
      }

      const token = await this.presentAutenticacion();

      if (!token) {
        return;
      }

      loading.present();

      try {
        const params = {
          aptaTuuid: this.global.DeviceId,
          caliNcorr: this.evaluacion.caliNcorr,
          seccCcod: this.seccion.seccCcod,
          asigCcod: this.seccion.asigCcod,
          alumnos: alumnos,
          token: token
        };
        const response = await this.api.guardarNotasEvaluacion(params);
        const { data } = response;

        if (data.success) {
          this.snackbar.showToast('Notas guardadas correctamente.', 3000, 'success');
          this.api.marcarVista(VISTAS_DOCENTE.INGRESA_NOTAS);
        }
        else if (data.message) {
          this.presentAlert(data.message);
        }
        else {
          throw Error();
        }
      }
      catch (error: any) {
        if (error && error.status == 401) {
          this.error.handle(error);
          return;
        }

        this.snackbar.showToast('No pudimos procesar su solicitud. Vuelva a intentar.', 3000, 'danger');
      }
      finally {
        loading.dismiss();
      }
    }
    else {
      this.notasForm.markAllAsTouched();
    }

  }
  resolverFoto(persNcorr: any) {
    return `${this.global.Api}/api/v4/avatar/${persNcorr}`;
  }
  resolverBloquearNota(alumno: any) {
    if (this.evaluacion.evaluacionCierre) {
      return true;
    }
    if (this.evaluacion.evaluacionPendiente) {
      return true;
    }
    if (alumno.vfecha == 0) {
      return true;
    }
    return false;
  }
  resolverFecha(fecha: string) {
    const fechaDate = moment(fecha, 'DD/MM/YYYY');
    let diaSemana = fechaDate.format("ddd").replace(".", "");
    diaSemana = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
    let mes = fechaDate.format('MMMM');
    mes = mes.charAt(0).toUpperCase() + mes.slice(1);
    return `${diaSemana} ${fechaDate.format('DD')} de ${mes}`;
  }
  mostrarMensajeBloqueo(alumno: any) {
    let mensaje = '';

    if (this.evaluacion.evaluacionCierre) {
      mensaje = 'Asignatura cerrada.';
    }
    if (this.evaluacion.evaluacionPendiente) {
      mensaje = 'Posee una evaluación previa pendiente por ingresar.';
    }
    if (alumno.vfecha == 0) {
      mensaje = 'Nota insertada hace más de 48hrs.';
    }

    if (mensaje) {
      this.presentAlert(mensaje);
    }

  }
  presentAlert(message: string) {
    this.alertCtrl.create({
      header: 'Advertencia',
      message: message,
      buttons: [{ text: 'Aceptar' }]
    }).then(alert => alert.present());
  }
  presentConfirm(message: string) {
    return new Promise(resolve => {
      this.alertCtrl.create({
        header: 'Advertencia',
        message: message,
        buttons: [
          {
            text: 'Cancelar',
            handler: () => {
              resolve(false)
            }
          },
          {
            text: 'Sí, Guardar',
            handler: () => {
              resolve(true)
            }
          }
        ]
      }).then(alert => alert.present())
    })
  }
  presentAutenticacion() {
    return new Promise(async resolve => {
      let modal = await this.modalCtrl.create({
        cssClass: 'mdl-auto',
        component: AutenticacionPage,
        componentProps: {},
        breakpoints: [0, 1],
        initialBreakpoint: 1
      });

      modal.onWillDismiss().then(token => {
        resolve(token.data);
      })

      await modal.present()
    })
  }

  get deshabilitarGuardar() {
    if (this.evaluacion) {
      if (this.evaluacion.evaluacionPendiente) {
        return true;
      }
      if (this.evaluacion.evaluacionCierre) {
        return true;
      }
    }
    if (!this.notasForm.valid) {
      return true;
    }

    return false;
  }
  get mostrarGuardar() {
    if (this.notas && this.notas.length) {
      return true;
    }
    return false;
  }
  get notasControls() {
    return (this.notasForm.get('notas') as FormArray).controls;
  }

}

export function NotaValidator(control: AbstractControl): any {
  if (control.value) {
    let nota = control.value.replace(',', '.');
    let notaParsed = parseFloat(nota);

    if (!isNaN(notaParsed)) {
      if ((notaParsed < 1 || notaParsed > 7) || nota.length != 3) {
        return { 'nota': true };
      }
    }
  }

  return null;
}