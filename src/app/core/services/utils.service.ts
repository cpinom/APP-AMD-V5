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
  divideBase64(base64: string, maxSize: number = 3 * 1024 * 1024): string[] {
    // Calcular el tamaño en caracteres para que corresponda a maxSize en bytes
    const chunkSize = Math.floor(maxSize * 4 / 3);
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
    const fragments: string[] = [];

    for (let i = 0; i < base64Data.length; i += chunkSize) {
      fragments.push(base64Data.substring(i, i + chunkSize));
    }

    return fragments;
  }
  fileToBase64(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // Cuando se haya leído el archivo, se ejecutará onload
      reader.onload = () => {
        const base64String = reader.result as string; // Asegurarse de que el resultado sea una cadena
        resolve(base64String);
      };

      // En caso de error, rechazar la promesa
      reader.onerror = (error) => {
        reject(error);
      };

      // Leer el archivo como Data URL (Base64)
      reader.readAsDataURL(file);
    });
  }
  resolverIcono(path: string) {
    const extension = this.getFileExtension(path) ?? '';
    // Mapeo de extensiones a tipos de íconos
    const iconMap: { [key: string]: string } = {
      // Documentos
      'pdf': 'picture_as_pdf',
      'doc': 'ms-word',
      'docx': 'ms-word',
      'xls': 'ms-excel',
      'xlsx': 'ms-excel',
      'ppt': 'ms-powerpoint',
      'pptx': 'ms-powerpoint',
      'txt': 'description',

      // Imágenes

      // Videos
      'mp4': 'video_library',
      'avi': 'video_library',
      'mkv': 'video_library',
      'mov': 'video_library',
      'wmv': 'video_library',

      // Audios
      'mp3': 'audio_file',
      'wav': 'audio_file',
      'ogg': 'audio_file',

      // Archivos comprimidos
      'zip': 'folder_zip',
      'rar': 'folder_zip',
      '7z': 'folder_zip',
      'tar': 'folder_zip',
      'gz': 'folder_zip',

      // Otros
      'html': 'code',
      'css': 'code',
      'js': 'code',
      'json': 'code',
      'xml': 'code'
    };

    const icon = iconMap[extension] || 'description';

    return `assets/icon/${icon}.svg`;
  }
  getFileExtension(filePath: string) {
    const lastDotIndex = filePath.lastIndexOf('.');

    if (lastDotIndex === -1 || lastDotIndex === filePath.length - 1) {
      return null; // No tiene extensión o termina con un punto
    }

    return filePath.substring(lastDotIndex + 1).toLowerCase();
  }
  isImage(path: string): boolean {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff', '.ico'];
    const extension = this.getFileExtension(path);

    // Validar si la extensión está en la lista
    return extension ? validExtensions.includes(`.${extension}`) : false;
  }

}
