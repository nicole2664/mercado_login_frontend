import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  // Entradas: lo que el padre le envía
  totalItems = input.required<number>();
  itemsPerPage = input.required<number>();
  currentPage = input.required<number>();
  fromItem = input.required<number>();
  toItem = input.required<number>();
  pagesArray = input.required<(number | string)[]>();
  totalPages = input.required<number>();

  // Salidas: lo que el hijo le avisa al padre
  onPageChange = output<number>();
  onNext = output<void>();
  onPrev = output<void>();
}
