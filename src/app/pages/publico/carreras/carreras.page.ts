import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/core/services/events.services';
import { PublicoService } from 'src/app/core/services/publico.service';

@Component({
  selector: 'app-carreras',
  templateUrl: './carreras.page.html',
  styleUrls: ['./carreras.page.scss'],
})
export class CarrerasPage implements OnInit, OnDestroy {

  @ViewChild(IonContent) content: IonContent | undefined;
  mostrarCargando = true;
  mostrarData = false;
  carrerasFiltro!: string;
  oferta: any;
  areas: any;
  carreras: any;
  carrerasFiltradas: any[] | undefined;
  subscription: Subscription;

  constructor(private api: PublicoService,
    private events: EventsService) {

    this.subscription = this.events.app.subscribe((event: any) => {
      if (event.action == 'scrollTop' && event.index == 2) {
        this.content?.scrollToTop(500);
      }
    });

  }

  ngOnInit() {
    this.cargar();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  async cargar() {
    try {
      const response = await this.api.getOferta();
      const { data } = response;

      if (data.success) {
        this.oferta = data.data.items;
        this.areas = this.oferta[0].areas;
        this.procesarCarreras();
        this.api.setStorage('oferta', this.oferta);
      }
      else {
        throw Error();
      }
    }
    catch (error: any) { }
    finally {
      this.mostrarData = true;
      this.mostrarCargando = false;
    }
  }
  recargar() {
    this.mostrarCargando = true;
    this.mostrarData = false;
    this.cargar();
  }
  procesarCarreras() {
    let carreras: any[] = [];

    this.areas.forEach((area: any) => {
      let carrerasArea: any[] = [];

      area.carrerasporinstitucion.forEach((institucion: any) => {
        carrerasArea = carrerasArea.concat(institucion['carreras']);
      });

      carrerasArea.forEach(carrera => {
        delete carrera['url'];

        this.oferta.forEach((sede: any) => {
          if (sede.id !== '0') {
            sede.areas.forEach((sedeArea: any) => {
              sedeArea.carrerasporinstitucion.forEach((carrInst: any) => {
                if (!('espeCcod' in carrera)) {
                  carrInst.carreras.forEach((carr: any) => {
                    if (carr.nombre === carrera.nombre) {
                      carrera['espeCcod'] = carr.espe_ccod;
                    }
                  });
                }
              });
            });
          }
        });

        carrera['areaCcod'] = area.id;
        carreras.push(carrera);
      });
    });

    carreras.sort(function (a, b) {
      if (a.nombre < b.nombre) {
        return -1;
      }
      if (a.nombre > b.nombre) {
        return 1;
      }
      return 0;
    });

    this.carreras = carreras;
    this.carrerasFiltradas = carreras;
    this.mostrarData = true;
  }
  filtrarCarreras() {
    this.carrerasFiltradas = this.carreras.filter((element:any) => {
      var text = element.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      var filter = this.carrerasFiltro.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      var index = text.indexOf(filter);

      return index > -1;
    });
  }
  resetCarreras() {
    this.carrerasFiltro = '';
    this.carrerasFiltradas = this.carreras;
  }
  resolverRegimen(carrera: any, regimen: string) {
    return carrera.regimen.indexOf(regimen) > -1;
  }

}
