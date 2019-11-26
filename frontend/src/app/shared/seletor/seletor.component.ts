import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-seletor',
  templateUrl: './seletor.component.html',
  styleUrls: ['./seletor.component.scss']
})
export class SeletorComponent implements OnInit, OnChanges {
  @Input() valor: number;
  @Input() label: string;
  @Input() disabled: boolean;
  @Input() minimo: number;
  @Input() maximo: number;
  @Input() unidade = '';
  @Input() step = 1;
  @Output() aoAlterarValor = new EventEmitter<number>();
  public value = 0;

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: any) {
    if (changes['valor']) {
      this.value = this.valor;
    }
  }

  public valorAlterado() {
    let valor = this.value;

    if (valor > this.maximo) {
      valor = this.maximo;
    } else if (valor < this.minimo) {
      valor = this.minimo;
    }

    this.value = valor ? +valor.toFixed(0) : valor;
    this.aoAlterarValor.emit(this.value);
  }
}
