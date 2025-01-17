import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { IonNav } from '@ionic/angular';
import * as moment from 'moment';
import { ApuntesService } from 'src/app/core/services/curso/apuntes.service';
import { EditarApuntePage } from '../editar-apunte/editar-apunte.page';
import { Swiper } from 'swiper/types';
import { ErrorService } from 'src/app/core/services/error.service';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
})
export class PrincipalPage implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('swiper') private swiperRef: ElementRef | undefined;
  slideOpts = {};
  data: any;
  calendario: any[] | undefined;
  semanaTitulo?: string;
  semanas: any[] = [];
  horario: any;
  apunte: any;
  apuntes: any;
  libro: any;
  mostrarApuntes?: boolean;
  mostrarCargandoPrincipal = true;
  mostrarCargando = true;
  mostrarSinDatos = false;
  swiper!: Swiper;

  constructor(private api: ApuntesService,
    private nav: IonNav,
    private error: ErrorService,
    private snackbar: SnackbarService) {
    moment.locale('es');

    Preferences.get({ key: 'Apunte' }).then((result) => {
      if (result.value) {
        this.apunte = JSON.parse(result.value!);
      }
    });
  }
  ngOnDestroy() {
    if (this.apunte) {
      Preferences.remove({ key: 'Apunte' });
    }
  }
  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.data = JSON.parse(result.value!);
      this.cargar(true);
    });

    this.api.marcarVista(VISTAS_DOCENTE.OBSERVACIONES);
  }
  async ngAfterViewInit() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
    this.swiperRef?.nativeElement.addEventListener('slidechangetransitionend', this.ionSlideDidChange.bind(this))
  }
  async ionViewWillEnter() {
    if (this.apuntes) {
      await this.recargar();
    }
  }
  async cargar(forceRefresh = false) {
    try {
      const params = { ssecNcorr: this.data.ssecNcorr };
      const response = await this.api.getPrincipal(params, forceRefresh);
      const { data } = response;

      if (data.success) {
        this.calendario = data.calendario;
        this.procesarSemanas();
      }
      else {
        this.api.removeStoreRequest(response.storeUrl);
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
      this.mostrarCargandoPrincipal = false;
    }
  }
  async recargar() {
    await this.seleccionarHorario(this.libro);

    try {
      const params = { ssecNcorr: this.data.ssecNcorr };
      const response = await this.api.getPrincipal(params);
      const { data } = response;
      let calendario = data.calendario;

      this.semanas.forEach(semana => {
        semana.dias.forEach((dia: any) => {
          if (dia.libro) {
            calendario.forEach((libro: any) => {
              if (libro.lclaNcorr == dia.libro.lclaNcorr && libro.apuntes != dia.libro.apuntes) {
                dia.libro.apuntes = libro.apuntes;
              }
            });
          }
        });
      });
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
        return;
      }

      this.snackbar.showToast('No pudimos procesar su solicitud. Vuelva a intentar.', 3000, 'danger');
    }
  }
  async procesarSemanas() {
    debugger
    if (this.calendario?.length == 0) {
      this.mostrarSinDatos = true;
      return;
    }
    let semanas = [];
    let fechaInicio = moment(this.calendario![0].lclaFclase, 'DD/MM/YYYY');
    let fechaTermino = moment(this.calendario![this.calendario!.length - 1].lclaFclase, 'DD/MM/YYYY');
    let semanaActual = fechaInicio.startOf('week').clone();

    do {
      semanas.push(this.resolverSemana(semanaActual.clone()));
      semanaActual = semanaActual.add('7', 'days');
    } while (!semanaActual.isAfter(fechaTermino, 'weeks'));

    this.semanas = semanas;

    if (this.semanas.length == 1) {
      this.ionSlideDidChange();
    } else {
      let semanaIndex = this.semanas.length - 1;

      if (this.apunte) {
        this.semanas.forEach((semana: any, index: number) => {
          let diaApunte = semana.dias.find((dia: any) => dia.fecha.format('DD/MM/YYYY') == this.apunte.lclaFclase);

          if (diaApunte) {
            semanaIndex = index;
          }
        })
      }

      this.swiper.slideTo(semanaIndex, 0);
    }

  }
  resolverSemana(semanaActual: moment.Moment) {
    let dias = [];
    let diaActual = semanaActual.clone();

    for (let i = 0; i < 6; i++) {
      let diaClase = diaActual.format('DD/MM/YYYY');
      let diaApuntes = this.calendario!.find(t => t.lclaFclase == diaClase);

      dias.push({
        fecha: diaActual.clone(),
        libro: diaApuntes,
        disabled: !diaApuntes,
        selected: false
      });

      diaActual = diaActual.add(1, 'day');
    }

    return {
      fecha: semanaActual,
      dias: dias
    };
  }
  async diaTap(dia: any, semana: any) {
    debugger
    if (!dia.disabled) {
      await this.seleccionarLibro(dia);
    }
  }
  async seleccionarLibro(diaTap: any) {
    debugger
    this.horario = undefined;

    this.semanas.forEach(semana => {
      semana.dias.forEach((dia: any) => {
        if (!dia.disabled) {
          dia.selected = diaTap.libro.lclaNcorr == dia.libro.lclaNcorr;
        }
      });
    });

    try {
      const params = { lclaFclase: diaTap.libro.lclaFclase, seccCcod: diaTap.libro.seccCcod };
      const response = await this.api.getHorarioSeccion(params);
      const { data } = response;

      if (data.success) {
        const horario = data.horario.find((t: any) => t.lclaNcorr == diaTap.libro.lclaNcorr);
        this.horario = data.horario;

        if (horario) {
          await this.seleccionarHorario(horario);
        }
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
  }
  async seleccionarHorario(horarioTap: any) {
    this.mostrarCargando = true;
    this.libro = horarioTap;

    this.horario.forEach((item: any) => {
      item.selected = item.lclaNcorr == horarioTap.lclaNcorr
    });

    try {
      const params = { lclaNcorr: horarioTap.lclaNcorr };
      const response = await this.api.getApuntesClase(params);
      const { data } = response;

      if (data.success) {
        this.apuntes = data.apuntes;
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
      this.mostrarCargando = false;
    }
  }
  moverSemana(dir: number) {
    if (dir > 0) this.swiper.slideNext();
    else this.swiper.slidePrev();
  }
  async ionSlideDidChange() {
    if (!this.semanas.length) return;

    let index = await this.swiper.activeIndex;
    let semana = this.semanas[index];

    if (!semana) return;

    let fechaInicio = semana.dias[0].fecha;
    let fechaTermino = semana.dias[5].fecha;

    if (fechaInicio.isSame(fechaTermino, 'month')) {
      this.semanaTitulo = `Semana del ${fechaInicio.format('D')} al ${fechaTermino.format('D [de] MMMM')}, ${fechaTermino.format('YYYY')}`;
    } else {
      this.semanaTitulo = `Semana del ${fechaInicio.format('D [de] MMMM')} al ${fechaTermino.format('D [de] MMMM')}, ${fechaTermino.format('YYYY')}`;
    }

    if (semana) {
      let dia = semana.dias.find((dia: any) => dia.disabled == false);

      if (this.apunte) {
        let diaApunte = semana.dias.find((dia: any) => dia.fecha.format('DD/MM/YYYY') == this.apunte.lclaFclase);

        if (diaApunte) {
          dia = diaApunte;
          Preferences.remove({ key: 'Apunte' });
          this.apunte = undefined;
        }
      }

      if (dia) {
        this.mostrarApuntes = true;
        this.seleccionarLibro(dia);
      } else {
        this.horario = undefined;
        this.apuntes = undefined;
        this.libro = undefined;
        this.mostrarApuntes = false;
      }
    }
  }
  async editar(data: any) {
    let seccion = this.horario.find((t: any) => t.selected);
    await this.nav.push(EditarApuntePage, { seccion: seccion, data: data });
  }
  async agregar() {
    let seccion = this.horario.find((t: any) => t.selected);
    await this.nav.push(EditarApuntePage, { seccion: seccion });
  }

}
