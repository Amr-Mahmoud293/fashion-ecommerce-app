import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IProduct } from '../../../core/models/product.model';
import { environment } from '../../../../environments/env';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [RouterLink],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Product {
  @Input() myProduct!: IProduct;
  @Output() addToCart = new EventEmitter<IProduct>();
  staticURL = environment.staticURL;


  onAddToCart(event: Event) {
    this.addToCart.emit(this.myProduct);
  }
}
