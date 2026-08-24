import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { MetricData } from '../models/metric-data';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;
  private metricSubject = new Subject<MetricData>();

  public connectionState$ = new BehaviorSubject<'connected' | 'reconnecting' | 'disconnected'>('disconnected');

  public metric$ = this.metricSubject.asObservable();

  public startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiBaseUrl}/hubs/dashboard`)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.onreconnecting(() => this.connectionState$.next('reconnecting'));
    this.hubConnection.onreconnected(() => this.connectionState$.next('connected'));
    this.hubConnection.onclose(() => this.connectionState$.next('disconnected'));

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connection started'))
      .catch(err => console.error('Error starting SignalR connection:', err));

    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.hubConnection.on('ReceiveMetric', (data: MetricData) => {
      this.metricSubject.next(data);
    });

    this.hubConnection.on('ReceiveMessage', (message: string) => {
      console.log('Server message:', message);
    });
  }

  public stopConnection(): void {
    this.hubConnection?.stop();
  }
}