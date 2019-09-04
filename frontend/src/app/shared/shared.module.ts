import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from '@app/material.module';
import { LoaderComponent } from './loader/loader.component';
import { SeletorComponent } from './seletor/seletor.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [FlexLayoutModule, MaterialModule, CommonModule, FormsModule],
  declarations: [LoaderComponent, SeletorComponent],
  exports: [LoaderComponent, SeletorComponent]
})
export class SharedModule {}
