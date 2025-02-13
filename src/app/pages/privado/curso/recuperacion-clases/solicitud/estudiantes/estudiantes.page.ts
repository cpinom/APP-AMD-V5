import { Component, OnInit } from '@angular/core';
import { AppGlobal } from 'src/app/app.global';

@Component({
  selector: 'app-estudiantes',
  templateUrl: './estudiantes.page.html',
  styleUrls: ['./estudiantes.page.scss'],
})
export class EstudiantesPage implements OnInit {

  alumnos!: any[];

  constructor(private global: AppGlobal) { }

  ngOnInit() {
  }

  resolverFoto(persNcorr: any) {
    return `${this.global.Api}/api/v4/avatar/${persNcorr}`;
  }

}
