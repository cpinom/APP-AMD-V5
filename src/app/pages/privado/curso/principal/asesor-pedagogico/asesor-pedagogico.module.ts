import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
// import { AsesorPedagogicoPageRoutingModule } from './asesor-pedagogico-routing.module';
import { AsesorPedagogicoPage } from './asesor-pedagogico.page';
import { ComponentsModule } from 'src/app/core/components/components.module';
import { SolicitudApoyoPageModule } from './solicitud-apoyo/solicitud-apoyo.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // AsesorPedagogicoPageRoutingModule,
    ComponentsModule,
    SolicitudApoyoPageModule
  ],
  declarations: [AsesorPedagogicoPage]
})
export class AsesorPedagogicoPageModule { }
