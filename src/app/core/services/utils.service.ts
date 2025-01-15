import { Injectable } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { FileOpener } from '@capacitor-community/file-opener';
import { Browser } from '@capacitor/browser';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(private pt: Platform) { }

  convertBlobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader;
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }
  async openFile(fileName: string, contentType: string, data: any) {
    if (this.pt.is('mobileweb')) {
      const linkSource = `${data}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    }
    else {
      const file = await Filesystem.writeFile({
        path: fileName,
        data: data,
        directory: Directory.Cache
      });

      await FileOpener.open({
        filePath: file.uri,
        contentType: contentType
      });
    }
  }
  async openLink(url: string) {
    return await Browser.open({ url: url });
  }

}
