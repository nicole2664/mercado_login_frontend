import { Injectable, signal, computed, Signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaginationService {

  createPagination<T>(allDataSignal: Signal<T[]>, itemsPerPage: number = 15) {
    const currentPage = signal(1);
    const itemsPerPageSignal = signal(itemsPerPage);

    const totalItems = computed(() => allDataSignal().length);

    const totalPages = computed(() => Math.ceil(totalItems() / itemsPerPageSignal()));

    const fromItem = computed(() =>
      totalItems() === 0 ? 0 : (currentPage() - 1) * itemsPerPageSignal() + 1,
    );

    const toItem = computed(() => Math.min(currentPage() * itemsPerPageSignal(), totalItems()));

    const pagedData = computed(() => {
      const start = (currentPage() - 1) * itemsPerPageSignal();
      return allDataSignal().slice(start, start + itemsPerPageSignal());
    });

    const pagesArray = computed(() => {
      const total = totalPages();
      const current = currentPage();
      const pages: (number | string)[] = [];

      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      // Lógica para mostrar: 1, 2, 3, ..., total
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }

      return pages;
    });

    return {
      currentPage,
      itemsPerPage: itemsPerPageSignal,
      totalItems,
      totalPages,
      fromItem,
      toItem,
      pagedData,
      pagesArray,
      goToPage: (page: number) => currentPage.set(page),
      nextPage: () => {
        if (currentPage() < totalPages()) currentPage.update((p) => p + 1);
      },
      prevPage: () => {
        if (currentPage() > 1) currentPage.update((p) => p - 1);
      },
    };
  }
}
