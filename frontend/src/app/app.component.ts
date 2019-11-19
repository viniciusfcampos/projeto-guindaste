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
  public loading = false;
  public status = {
    rotacao: false,
    altura: false,
    eletroima: false
  };

  constructor(
    private socket: Socket
  ) {}

  ngOnInit() {
    this.socket.on('rotacao', (status: any) => (this.rotacaoRecebida(status)));
    this.socket.on('altura', (status: any) => (this.alturaRecebida(status)));
    this.socket.on('eletroima', (status: any) => (this.acionamentoRecebido(status)));
  }

  public getMessages = () => {
    return new Observable((observer) => {
        this.socket.on('rotacao', (message: any) => {
            observer.next(message);
        });
    });
  }

  public rotacaoAlterada(valor: number) {
    this.atualizarStatus('rotacao', true);
    this.enviarMensagem('rotacao', valor);
  }
  
  public alturaAlterada(valor: number) {
    this.atualizarStatus('altura', true);
    this.enviarMensagem('altura', valor);
  }
  
  public alterarAcionamento() {
    this.acionar = !this.acionar;
    this.atualizarStatus('eletroima', true);
    this.enviarMensagem('eletroima', +this.acionar);
  }
  
  private enviarMensagem(comando: string, valor: number){
    this.socket.emit(comando, valor);
  }

  private rotacaoRecebida(status: any) {
    this.atualizarStatus('rotacao', false, status);
  }

  private alturaRecebida(status: any) {
    this.atualizarStatus('altura', false, status);
  }

  private acionamentoRecebido(status: any) {
    this.atualizarStatus('eletroima', false, status);
  }
  
  private atualizarStatus(propriedade: string, valor: boolean, retorno: any = null) {
    console.log('[Status]', propriedade, valor, retorno);
    this.status[propriedade] = valor;
    this.loading = Object.values(this.status).some(s => s);
  }
}
