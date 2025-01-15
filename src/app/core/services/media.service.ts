import { Injectable } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { FilePicker } from '@capawesome/capacitor-file-picker';

interface MediaFile {
  path: string,
  data: string,
  name: string,
  size: number
};

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  constructor(private action: ActionSheetController) { }
  async getMedia(excludeDocument = false): Promise<MediaFile | null> {

    try {
      const sourceType = await this.present();

      if (sourceType == 'DOCUMENT') {
        const result = await FilePicker.pickFiles({
          types: excludeDocument == true ? ['image/jpeg', 'image/png'] : ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          // multiple: false,
          limit: 1,
          readData: true
        });

        return Promise.resolve({
          path: result.files[0].path,
          data: result.files[0].data,
          name: result.files[0].name,
          size: result.files[0].size
        } as MediaFile);
      } else {
        const image = await Camera.getPhoto({
          quality: 70,
          allowEditing: true,
          resultType: CameraResultType.Uri,
          height: 1000,
          width: 1000,
          source: sourceType == 'CAMERA' ? CameraSource.Camera : CameraSource.Photos
        });

        const statFile = await Filesystem.stat({ path: image.path! });
        const readFile = await Filesystem.readFile({ path: image.path! });

        return Promise.resolve({
          path: image.path,
          data: 'data:image/jpeg;base64,' + readFile.data,
          name: `foto_${(new Date()).getTime()}.jpg`,
          size: statFile.size
        } as MediaFile);
      }
    }
    catch (error) {
      console.log('Error result');
      console.log(error);
      return Promise.resolve(null);
    }
  }
  private async present() {
    return new Promise((resolve, reject) => {
      this.action.create({
        header: 'Elegir',
        buttons: [
          {
            text: 'Cámara',
            handler: () => resolve("CAMERA")
          },
          {
            text: 'Galería',
            handler: () => resolve("PHOTOS")
          },
          {
            text: 'Documento',
            handler: () => resolve("DOCUMENT")
          },
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => reject()
          }
        ]
      }).then(actionSheet => actionSheet.present());
    });
  }

}
