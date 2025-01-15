import { Injectable } from '@angular/core';
import { PrivateService } from './private.service';
import { AppGlobal } from '../../app.global';
import { AuthService } from '../auth/auth.service';
import { CachingService } from './caching.service';
import { ToastController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class InacapmailService extends PrivateService {

  private storagePrefix: string = 'InacapMail-AMD';

  constructor(global: AppGlobal,
    auth: AuthService,
    caching: CachingService,
    toast: ToastController,
    ) {
    super(global, auth, caching, toast);
  }
  getCorreos() {
    return this.get(`${this.baseUrl}/inacapmail/v2/correos`, undefined, undefined, true);
  }
  getPrincipal(forceRefresh = false) {
    return this.get(`${this.baseUrl}/inacapmail/v2/principal`, forceRefresh, undefined, true);
  }
  getMessages(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/inacapmail/v2/messages`, params, forceRefresh);
  }
  getMessage(messageId: string, forceRefresh = false) {
    return this.get(`${this.baseUrl}/inacapmail/v2/message/${messageId}`, forceRefresh, undefined, true);
  }
  createMessage(params: any) {
    return this.post(`${this.baseUrl}/inacapmail/v2/create-message`, params);
  }
  createReply(params: any) {
    return this.post(`${this.baseUrl}/inacapmail/v2/create-reply`, params);
  }
  updateMessage(params: any) {
    return this.post(`${this.baseUrl}/inacapmail/v2/update-message`, params);
  }
  sendMessage(params: any) {
    return this.post(`${this.baseUrl}/inacapmail/v2/send-message`, params);
  }
  addAttachmentWeb(data: FormData, params: any) {
    return this.uploadWeb(`${this.baseUrl}/inacapmail/v2/add-attachment`, data, params);
  }
  addAttachment(filepath: string, filename: string, params: any) {
    return this.upload(`${this.baseUrl}/inacapmail/v2/add-attachment`, filepath, filename, params);
  }
  removeAttachment(params: any) {
    return this.post(`${this.baseUrl}/inacapmail/v2/remove-attachment`, params);
  }
  downloadAttachment(params: any) {
    return this.post(`${this.baseUrl}/inacapmail/v2/download`, params);
  }
  deleteMessage(messageId: string) {
    return this.get(`${this.baseUrl}/inacapmail/v2/delete-message/${messageId}`);
  }
  markRead(messageId: string) {
    return this.get(`${this.baseUrl}/inacapmail/v2/mark-read/${messageId}`);
  }
}
