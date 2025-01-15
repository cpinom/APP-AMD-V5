import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonNav, LoadingController } from '@ionic/angular';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-excepcion',
  templateUrl: './excepcion.page.html',
  styleUrls: ['./excepcion.page.scss'],
})
export class ExcepcionPage implements OnInit {

  user: any;
  seccion: any;
  alumnos: any;
  jefeCarrera: any;
  excepcionForm!: FormGroup;
  patternStr = '^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ!@#\n\r\$%\^\&*\ \)\(+=,._-]+$';

  constructor(private fb: FormBuilder,
    private auth: AuthService,
    private nav: IonNav,
    private loading: LoadingController,
    private api: CursoService,
    private error: ErrorService,
    private snackbar: SnackbarService) {

    this.auth.getAuth().then(auth => {
      this.user = auth.user;
    });

    this.excepcionForm = this.fb.group({
      alumnos: ['', Validators.required],
      mensaje: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(2000),
        Validators.pattern(this.patternStr)
      ])]
    });
  }

  ngOnInit() {
    this.api.marcarVista(VISTAS_DOCENTE.CURSO_EXCEPCION);
  }
  async enviarCorreo() {
    if (this.excepcionForm.valid) {
      let loading = await this.loading.create({ message: 'Enviado...' });
      let alumnos = (this.excepcionForm.get('alumnos')?.value as any[]).map(item => {
        return `${item.persTnombre} ${item.persTapePaterno} ${item.persTapeMaterno}`;
      });
      const params = {
        asigCcod: this.seccion.asigCcod,
        asigTdesc: this.seccion.asigTdesc,
        correoEnvia: this.user.persTemailInacap,
        correoRecibe: this.jefeCarrera ? this.jefeCarrera.persTemailInacap : '',
        persTnombre: this.user.persTnombreCompleto,
        mensaje: this.excepcionForm.get('mensaje')?.value,
        alumnos: alumnos.join('|')
      };
      await loading.present();

      try {
        const response = await this.api.enviarInformeDescuadre(params);
        const { data } = response;

        if (data.success) {
          this.cerrar();
          this.snackbar.showToast('El correo electrónico ha sido enviado correctamente.', 4000, 'success');
          this.api.marcarVista(VISTAS_DOCENTE.CURSO_ENVIA_EXCEPCION);
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
      this.excepcionForm.markAllAsTouched();
    }
  }
  cerrar() {
    this.nav.pop();
  }
  get alumnosError() {
    if (this.excepcionForm.touched) {
      if (this.excepcionForm.get('alumnos')?.hasError('required')) return 'Campo es obligatorio.';
    }
    return '';
  }
  get mensajeError() {
    if (this.excepcionForm.get('mensaje')?.hasError('required')) return 'Campo es obligatorio.';
    if (this.excepcionForm.get('mensaje')?.hasError('maxlength')) return 'Máximo 2000 caracteres permitidos.';
    if (this.excepcionForm.get('mensaje')?.hasError('pattern')) return 'Campo con caracteres no permitidos.';
    return '';
  }

}
