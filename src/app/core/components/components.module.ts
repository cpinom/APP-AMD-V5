import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { CachedImageComponent } from "./cached-image/cached-image.component";
import { ImageModalComponent } from "./image-modal/image-modal.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

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
    ImageModalComponent
  ],
  exports: [
    CachedImageComponent,
    ImageModalComponent
  ]
})
export class ComponentsModule { }