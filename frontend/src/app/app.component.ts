import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

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
    // this.getMessages().subscribe(x => console.log(x));
    this.socket.on('rotacao', this.rotacaoRecebida);
    this.socket.on('altura', this.alturaRecebida);
    this.socket.on('eletroima', this.acionamentoRecebido);
  }

  public getMessages = () => {
    return new Observable((observer) => {
        this.socket.on('rotacao', (message: any) => {
            observer.next(message);
        });
    });
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

  private rotacaoRecebida(status: any) {
    console.log('rotacao ', status);
  }

  private alturaRecebida(status: any) {
    console.log('altura ', status);
  }

  private acionamentoRecebido(status: any) {
    console.log('eletroima ', status);
  }
}
