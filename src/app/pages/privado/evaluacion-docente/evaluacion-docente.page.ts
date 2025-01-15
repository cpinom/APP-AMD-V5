import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-evaluacion-docente',
  templateUrl: './evaluacion-docente.page.html',
  styleUrls: ['./evaluacion-docente.page.scss'],
})
export class EvaluacionDocentePage implements OnInit {

  periodoForm!: FormGroup;
  periodos: any;
  sedes: any;
  sede: any;
  mostrarData = false;
  data: any;
  mostrarCargando = true;

  alertPeriodo = {
    header: 'Período Académico',
    message: 'Seleccione el período que desee visualizar'
  };

  constructor(private api: CursoService,
    private fb: FormBuilder,
    private error: ErrorService,
    private snackbar: SnackbarService) {

    this.periodoForm = this.fb.group({
      periodo: [, Validators.required]
    });

    this.periodoForm.get('periodo')?.valueChanges.subscribe(() => {
      this.cargarResutados();
    });

  }
  ngOnInit() {
    this.cargar();
    this.api.marcarVista(VISTAS_DOCENTE.RESULTADOS_EVALUACION_DOCENTE);
  }
  async cargar() {
    try {
      const response = await this.api.getPeriodosEvalDocente();
      const { data } = response;

      if (data.success) {
        this.periodos = data.periodos;
        this.sedes = data.sedes;
        this.sede = this.sedes[0];
        this.periodoForm.get('periodo')?.setValue(this.periodos[0]);
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
      // this.mostrarData = true;
    }
  }
  async cargarResutados() {
    this.mostrarCargando = true;

    try {
      const params = {
        periCcod: this.periodoForm.get('periodo')?.value.periCcod,
        sedeCcod: this.sede.sedeCcod
      };
      const response = await this.api.getEvaluacionDocente(params);
      const { data } = response;

      if (data.success) {
        this.data = data.data;
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
      this.mostrarData = true;
      this.mostrarCargando = false;
    }
  }
  recargar() {
    if (!this.periodos) {
      this.mostrarCargando = true;
      this.mostrarData = false;
      this.cargar();
    }
    else {
      if (this.periodoForm.get('periodo')?.valid) {
        this.cargarResutados();
      }
    }
  }

}
