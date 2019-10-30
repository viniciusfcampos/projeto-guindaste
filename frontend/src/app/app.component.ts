import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public acionar = false;
  public statusRotacao = false;
  public statusAltura = false;
  public statusEletroima = false;

  constructor(
    private socket: Socket
  ) {}

  ngOnInit() {
    this.socket.on('rotacao', (status: boolean) => this.statusRotacao = status);
    this.socket.on('altura', (status: boolean) => this.statusAltura = status);
    this.socket.on('eletroima', (status: boolean) => this.statusEletroima = status);
  }

  public rotacaoAlterada(valor: number) {
    this.enviarMensagem('rotacao', valor);
  }
  
  public alturaAlterada(valor: number) {
    this.enviarMensagem('altura', valor);
  }
  
  public alterarAcionamento() {
    this.acionar = !this.acionar;
    this.enviarMensagem('eletroima', +this.acionar);
  }
  
  private enviarMensagem(comando: string, valor: number){
    this.socket.emit(comando, valor);
  }
}
