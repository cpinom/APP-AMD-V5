import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { PublicoService } from 'src/app/core/services/publico.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-detalle-carrera',
  templateUrl: './detalle-carrera.page.html',
  styleUrls: ['./detalle-carrera.page.scss'],
})
export class DetalleCarreraPage implements OnInit {

  areaCcod: string | null;
  carrCcod: string | null;
  data: any;
  matricula = false;
  modalidad = {
    'diurna': false,
    'vespertina': false
  };
  infoTitulo!: string;
  infoHTML!: string;

  constructor(private api: PublicoService,
    private route: ActivatedRoute,
    private utils: UtilsService) {
    this.areaCcod = this.route.snapshot.paramMap.get('areaCcod');
    this.carrCcod = this.route.snapshot.paramMap.get('espeCcod');
  }
  ngOnInit() {
    this.cargar();
  }
  async cargar() {
    try {
      const params = { carrCcod: this.carrCcod };
      const response = await this.api.getCarrera(params);
      const { data } = response;

      if (data.success) {
        this.data = data.data;
        this.data.nombre = data.data.nombre.replace(/\(.*\)/, '');
        this.matricula = data.data.permitirPostular;

        const oferta = await this.api.getStorage('oferta');
        let sedes: any = [];

        oferta.forEach((sede: any) => {
          if (sede.id !== '0') {
            sede.areas.forEach((area: any) => {
              if (area.id === this.areaCcod) {
                area.carrerasporinstitucion.forEach((institucion: any) => {
                  institucion.carreras.forEach((carrera: any) => {
                    if (carrera.espe_ccod === this.carrCcod) {
                      sedes.push({
                        sedeCcod: sede.id,
                        sedeTdesc: sede.nombre
                      });
                      if (carrera.regimen) {
                        this.modalidad.diurna = carrera.regimen.indexOf('diurna') > -1;
                        this.modalidad.vespertina = carrera.regimen.indexOf('vespertina') > -1;
                      }
                    }
                  });
                });

                if (!this.data.hasOwnProperty('nombre_area')) {
                  this.data.nombre_area = area.nombre;
                }
              }
            });
          }
        });

        this.data.sedes = sedes;
      }
      else {
        throw Error();
      }
    }
    catch (error: any) { }
  }
  fupTap() {
    this.utils.openLink('https://siga.inacap.cl/inacap.fup/');
  }
  mostrarDetalle(index: number, modal: IonModal) {
    this.infoTitulo = index === 1 ? 'Descripción' : (index === 2 ? 'Perfil de Egreso' : 'Campo Ocupacional');
    this.infoHTML = index === 1 ? this.data.descripcion : (index === 2 ? this.data.perfil : this.data.campo);
    modal.present();
  }

}
