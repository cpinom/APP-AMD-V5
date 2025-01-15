import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ResumenPageRoutingModule } from './resumen-routing.module';
import { ResumenPage } from './resumen.page';
// import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { NgChartsModule } from 'ng2-charts';
import { ComponentsModule } from 'src/app/core/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ResumenPageRoutingModule,
    // ZXingScannerModule,
    NgChartsModule,
    ComponentsModule
  ],
  declarations: [ResumenPage]
})
export class ResumenPageModule {}
