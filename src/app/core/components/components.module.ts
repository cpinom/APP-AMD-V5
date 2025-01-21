import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { CachedImageComponent } from "./cached-image/cached-image.component";
import { ImageModalComponent } from "./image-modal/image-modal.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { BarcodeScanningModalComponent } from "./barcode-scanning-modal/barcode-scanning-modal.component";

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    CachedImageComponent,
    ImageModalComponent,
    BarcodeScanningModalComponent
  ],
  exports: [
    CachedImageComponent,
    ImageModalComponent,
    BarcodeScanningModalComponent
  ]
})
export class ComponentsModule { }