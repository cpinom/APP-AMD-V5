import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { PrivateService } from '../private.service';
import { AppGlobal } from '../../../app.global';
import { Preferences } from '@capacitor/preferences';
import { CachingService } from '../caching.service';
import { ToastController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class CursoService extends PrivateService {

  private storagePrefix: string = 'Curso-AMD';

  constructor(global: AppGlobal,
    auth: AuthService,
    caching: CachingService,
    toast: ToastController,
  ) {
    super(global, auth, caching, toast);
  }
  getMailSummary() {
    return this.get(`${this.baseUrl}/inacapmail/v2/summary`);
  }
  getCorreos() {
    return this.get(`${this.baseUrl}/inacapmail/v2/correos`, undefined, undefined, true);
  }
  guardarPeriodo(params: any) {
    return this.post(`${this.baseUrl}/curso/v4/guardar-periodo`, params);
  }
  getStatus() {
    return this.get(`${this.baseUrl}/curso/v4/status`);
  }
  getPrincipal(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/curso/v4/principal`, params, forceRefresh, undefined, true);
  }
  getClases(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/curso/v4/clases`, params, forceRefresh, undefined, true);
  }
  getEstadoClase(params: any) {
    return this.post(`${this.baseUrl}/curso/v4/estado-clase`, params, true, undefined, false);
  }
  getContactosSedes() {
    return this.get(`${this.baseUrl}/curso/v4/contactos-sedes`);
  }
  validarSala(params: any) {
    return this.post(`${this.baseUrl}/curso/v4/validar-sala`, params);
  }
  iniciarClase(params: any) {
    return this.post(`${this.baseUrl}/curso/v4/iniciar-clase`, params);
  }
  getAsistenciaClase(params: any) {
    return this.post(`${this.baseUrl}/curso/v4/asistencia-clase`, params);
  }
  guardarAsistencia(params: any) {
    return this.post(`${this.baseUrl}/curso/v4/guardar-asistencia`, params);
  }
  guardarAsistenciaV5(params: any) {
    return this.post(`${this.baseUrl}/curso/v5/guardar-asistencia`, params);
  }
  terminarClase(params: any) {
    return this.post(`${this.baseUrl}/curso/v4/terminar-clase`, params);
  }
  enviarInformeDescuadre(params: any) {
    return this.post(`${this.baseUrl}/curso/v4/informe-descuadre`, params);
  }
  getAvancesAprendizajes(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/curso/v4/avances-aprendizajes`, params, forceRefresh);
  }
  actualizaAvancesAprendizajes(params: any) {
    return this.post(`${this.baseUrl}/curso/v4/actualizar-avances-aprendizajes`, params);
  }
  getHorarioSeccion(params: any) {
    return this.post(`${this.baseUrl}/curso/v4/horario-seccion`, params, true);
  }
  getResumenSeccion(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/curso/v4/resumen-seccion`, params, forceRefresh, undefined, true);
  }
  getRiesgosEstudiantes(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/curso/v4/riesgos-estudiantes`, params, forceRefresh, undefined, true);
  }
  getApoyoProgresion(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/curso/v4/apoyo-progresion`, params, forceRefresh, undefined, true);
  }
  getCategoriasTutorias() {
    return this.get(`${this.baseUrl}/curso/v4/categorias-tutorias`);
  }
  solicitarTutoria(params: any) {
    return this.post(`${this.baseUrl}/curso/v4/solicitud-tutoria`, params);
  }
  getDistribucionNotas(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/curso/v4/distribucion-notas`, params, forceRefresh, undefined, true);
  }
  getAlumnosSeccion(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/curso/v4/alumnos-seccion`, params, forceRefresh, undefined, true);
  }

  getOportunidadesDetalle(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/curso/v4/oportunidades-detalle`, params, forceRefresh, undefined, true);
  }
  getTiposAlumnosDetalle(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/curso/v4/tipos-alumnos-detalle`, params, forceRefresh, undefined, true);
  }
  getPerfilAlumnosDetalle(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/curso/v4/perfil-alumnos-detalle`, params, forceRefresh, undefined, true);
  }
  getPrerequisitosDetalle(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/curso/v4/prerequisitos-detalle`, params, forceRefresh, undefined, true);
  }

  getPeriodosEvalDocente(): Promise<any> {
    return this.get(`${this.baseUrl}/curso/v4/periodos-evaluacion`);
  }
  getEvaluacionDocente(params: any): Promise<any> {
    return this.post(`${this.baseUrl}/curso/v4/evaluacion-docente`, params);
  }
  getTicketsSoporte(params: any): Promise<any> {
    return this.post(`${this.baseUrl}/curso/v4/tickets-soporte`, params);
  }
  // cargarArchivoTicketWeb(data: FormData, params?: any) {
  //   return this.uploadWeb(`${this.baseUrl}/curso/v4/agregar-archivo-ticket`, data, params);
  // }
  // async cargarArchivoTicket(filepath: string, filename: string, params?: any) {
  //   return this.upload(`${this.baseUrl}/curso/v4/agregar-archivo-ticket`, filepath, filename, params);
  // }
  cargarArchivoTicketV5(aptiNcorr: any, params: any) {
    return this.post(`${this.baseUrl}/curso/v5/agregar-archivo-ticket?aptiNcorr=${aptiNcorr}`, params);
  }
  descargarArchivoTicket(params: any): Promise<any> {
    return this.post(`${this.baseUrl}/curso/v4/descargar-archivo-ticket`, params);
  }
  eliminarArchivoTicket(params: any): Promise<any> {
    return this.post(`${this.baseUrl}/curso/v4/eliminar-archivo-ticket`, params);
  }
  enviarTicket(params: any): Promise<any> {
    return this.post(`${this.baseUrl}/curso/v4/enviar-ticket`, params);
  }
  cancelarTicket(params: any): Promise<any> {
    return this.post(`${this.baseUrl}/curso/v4/cancelar-ticket`, params);
  }
  getSalasSede(params: any): Promise<any> {
    return this.post(`${this.baseUrl}/curso/v4/salas-sede`, params);
  }
  getSalasSedeV5(lclaNcorr: any, sedeCcod: any, salaCcod: any): Promise<any> {
    return this.get(`${this.baseUrl}/curso/v5/salas-sede?lclaNcorr=${lclaNcorr}&sedeCcod=${sedeCcod}&salaCcod=${salaCcod}`);
  }
  cambiarSalaClase(params: any): Promise<any> {
    return this.post(`${this.baseUrl}/curso/v4/cambiar-sala-clase`, params);
  }


  async setStorage(key: any, value: any) {
    await Preferences.set({ key: `${this.storagePrefix}-${key}`, value: JSON.stringify(value) });
  }
  async getStorage(key: any) {
    const result = await Preferences.get({ key: `${this.storagePrefix}-${key}` });
    return result.value ? JSON.parse(result.value) : null;
  }
  async clearStorage() {
    await Preferences.remove({ key: `${this.storagePrefix}-categorias` });
  }

}
