import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-solicitud-apoyo',
  templateUrl: './solicitud-apoyo.page.html',
  styleUrls: ['./solicitud-apoyo.page.scss'],
})
export class SolicitudApoyoPage implements OnInit {

  seccion: any;
  alumnos: any;
  categorias!: any[];
  form: FormGroup;
  submitted = false;
  patternStr = '^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ!@#\n\r\$%\^\&*\ \)\(+=,._-]+$';

  constructor(private modalCtrl: ModalController,
    private fb: FormBuilder,
    private api: CursoService,
    private snackbar: SnackbarService,
    private loading: LoadingController,
    private error: ErrorService) {

    this.form = this.fb.group({
      catuCcod: [, Validators.required],
      amtuTmotivo: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(2000),
        Validators.pattern(this.patternStr)
      ])]
    })
  }
  ngOnInit() { }
  async enviar() {
    if (this.form.valid) {
      let loading = await this.loading.create({ message: 'Procesando...' });
      let alumnos = this.alumnos.map((t: any) => {
        return {
          persNcorr: t.persNcorr,
          persNrut: t.persNrut,
          persXdv: t.persXdv,
          persTnombre: t.persTnombre,
          persTapePaterno: t.persTapePaterno,
          persTapeMaterno: t.persTapeMaterno
        }
      });
      const params = {
        sedeCcod: this.seccion.sedeCcod,
        seccCcod: this.seccion.seccCcod,
        asigCcod: this.seccion.asigCcod,
        asigTdesc: this.seccion.asigTdesc,
        catuCcod: this.catuCcod?.value.catuCcod,
        catuTdesc: this.catuCcod?.value.catuTdesc,
        amtuTmotivo: this.amtuTmotivo?.value,
        alumnos: alumnos
      };

      await loading.present();

      try {
        const response = await this.api.solicitarTutoria(params);
        const { data } = response;

        if (data.success) {
          this.snackbar.showToast('Solicitud procesada correctamente.', 3000, 'success');
          this.modalCtrl.dismiss({ action: 'reload' });
          this.api.marcarVista(VISTAS_DOCENTE.WIDGET_ASESOR_SOLICITUD);
        } else {
          this.snackbar.showToast(data.message, 3000, 'danger');
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
        await loading.dismiss();
      }
    }
    else {
      this.form.markAllAsTouched();
    }
  }
  async cerrar() {
    await this.modalCtrl.dismiss();
  }
  get catuCcod() { return this.form.get('catuCcod'); }
  get amtuTmotivo() { return this.form.get('amtuTmotivo'); }
  get errorMotivo() {
    if (this.form.touched) {
      if (this.catuCcod?.hasError('required')) return 'Campo obligatorio.';
    }
    return '';
  }
  get errorComentarios() {
    if (this.amtuTmotivo?.hasError('required')) return 'Campo obligatorio.';
    if (this.amtuTmotivo?.hasError('maxlength')) return 'Máximo de 2000 caracteres permitidos.';
    if (this.amtuTmotivo?.hasError('pattern')) return 'Campo con caracteres no permitidos.';
    return '';
  }

}
