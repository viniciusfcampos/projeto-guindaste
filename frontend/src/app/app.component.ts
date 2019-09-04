import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public acionar = false;

  constructor() {}

  ngOnInit() {
  }

  public rotacaoAlterada(valor: number) {
    console.log('Rotação', valor);
  }

  public alturaAlterada(valor: number) {
    console.log('Altura', valor);
  }

  public alterarAcionamento() {
    this.acionar = !this.acionar;
    console.log('Ativar imã', this.acionar);
  }
}
