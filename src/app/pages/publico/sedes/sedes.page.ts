import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonModal, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/core/services/events.services';
import { PublicoService } from 'src/app/core/services/publico.service';
import { AppGlobal } from 'src/app/app.global';
import { Geolocation } from '@capacitor/geolocation';
import * as geometry from 'spherical-geometry-js';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DialogService } from 'src/app/core/services/dialog.service';

@Component({
  selector: 'app-sedes',
  templateUrl: './sedes.page.html',
  styleUrls: ['./sedes.page.scss'],
})
export class SedesPage implements OnInit, OnDestroy {

  @ViewChild(IonContent) content: IonContent | undefined;
  @ViewChild('map') mapRef!: ElementRef;
  // map!: GoogleMap;
  subscription: Subscription;
  sedes: any;
  sedesFiltradas: any;
  activeTab = 0;
  sedesFiltro: string | undefined;
  sedeData: any;
  sedeMapa: any;
  mostrarCargando = true;
  mostrarData = false;

  constructor(private api: PublicoService,
    private events: EventsService,
    private global: AppGlobal,
    private dialog: DialogService,
    private pt: Platform,
    private utils: UtilsService) {

    this.subscription = this.events.app.subscribe((event: any) => {
      if (event.action == 'scrollTop' && event.index == 3) {
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
      const response = await this.api.getSedes();
      const { data } = response;

      if (data.success) {
        this.sedes = data.sedes;
        this.sedesFiltradas = this.sedes;
      }
      else {
        throw Error();
      }
    }
    catch (error) { }
    finally {
      this.mostrarCargando = false;
      this.mostrarData = true;
    }
  }
  recargar() {
    this.mostrarCargando = true;
    this.mostrarData = false;
    this.cargar();
  }
  async tabsChanged(ev: any) {
    this.activeTab = ev.detail.value;
    this.sedesFiltro = '';

    if (this.activeTab == 0) {
      this.sedesFiltradas = this.sedes;
    }
    else if (this.activeTab == 1) {
      this.sedesFiltradas = await this.sedesCercanas();
    }
  }
  async sedesCercanas() {
    if (this.sedes.length == 0) {
      return [];
    }

    const loading = await this.dialog.showLoading({ message: 'Cargando...' });
    var cercanas = [];

    try {
      const position = await this.getCurrentPosition();

      if (position != null) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const currentPosition = new geometry.LatLng(latitude, longitude);
        const distances: any = [];

        this.sedes.forEach((sede: any) => {
          var sedePosition = new geometry.LatLng(sede.sedeTlatitud, sede.sedeTlongitud);
          var distancia = geometry.computeDistanceBetween(currentPosition, sedePosition);

          distances.push({
            result: distancia,
            data: sede,
            id: sede.sedeCcod
          });
        });

        distances.sort((obj1: any, obj2: any) => {
          if (obj1.result < obj2.result) return -1;
          else if (obj1.result > obj2.result) return 1;
          else return 0;
        });

        let i = 0;

        while (i < 10) {
          distances[i].data['km'] = (distances[i].result / 1000).toFixed(1) + ' km';

          try {
            cercanas.push(distances[i].data);
          }
          catch { }

          i++;
        }
      }
    }
    catch (error) { }
    finally {
      await loading.dismiss();
    }

    return cercanas;
  }
  async getCurrentPosition() {
    let coordinates: any;

    try {
      let permission = await Geolocation.checkPermissions();

      if (permission.location == 'denied' || permission.location == 'prompt') {
        if (this.pt.is('capacitor')) {
          permission = await Geolocation.requestPermissions();
        }
      }

      if (permission.location == 'denied') {
        if (this.pt.is('capacitor')) {
          this.utils.showAlertCamera();
          return null;
        }
      }

      coordinates = await Geolocation.getCurrentPosition();
    }
    catch { }

    return coordinates;
  }
  filtrarSedes() {
    this.sedesFiltradas = this.sedes.filter((element: any) => {
      var text = element.sedeTdesc.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      var filter = this.sedesFiltro?.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      var index = text.indexOf(filter);

      return index > -1;
    });
  }
  resetSedes() {
    this.activeTab = 0;
    this.sedesFiltro = '';
    this.sedesFiltradas = this.sedes;
  }
  resolverFoto(sedeCcod: string) {
    return `${this.global.Api}/api/v3/imagen-sede/${sedeCcod}`;
  }
  updateUrl(ev: any) {
    ev.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mM8/B8AAosBxERSgsYAAAAASUVORK5CYII=';
  }
  async mostrarSede(data: any, modal: IonModal) {
    this.sedeData = data;

    await modal.present();

    // this.sedeMapa = await GoogleMap.create({
    //   id: 'sede-mapa',
    //   element: this.mapRef.nativeElement,
    //   apiKey: environment.mapsKey,
    //   forceCreate: true,
    //   config: {
    //     center: {
    //       lat: parseFloat(data.sedeTlatitud),
    //       lng: parseFloat(data.sedeTlongitud),
    //     },
    //     zoom: 15
    //   }
    // });

    // await this.sedeMapa.addMarker({
    //   coordinate: {
    //     lat: parseFloat(data.sedeTlatitud),
    //     lng: parseFloat(data.sedeTlongitud)
    //   }
    // });
  }
  async centrar() {
    await this.sedeMapa.setCamera({
      coordinate: {
        lat: parseFloat(this.sedeData.sedeTlatitud),
        lng: parseFloat(this.sedeData.sedeTlongitud)
      }
    });
  }
  abrirNavegador(url: string) {
    this.utils.openLink(url);
  }

}
