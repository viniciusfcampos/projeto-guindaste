import { Component, OnInit } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpRequest,
  HttpHeaders
} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public acionar = false;

  constructor(
    private http: HttpClient,
  ) {}

  ngOnInit() {
  }

  public rotacaoAlterada(valor: number) {
    this.http.post('rotacao', null, { params: { valor: valor.toString() } }).subscribe();
  }
  
  public alturaAlterada(valor: number) {
    this.http.post('altura', null, { params: { valor: valor.toString() } }).subscribe();
  }
  
  public alterarAcionamento() {
    this.acionar = !this.acionar;
    this.http.post('eletroima', null, { params: { acionar: this.acionar.toString() } }).subscribe();
  }
}
