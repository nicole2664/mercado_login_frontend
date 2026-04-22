import {
  Component,
  signal,
  inject,
  computed,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Pagination } from '../../../shared/components/pagination/pagination';
import { PermissionsService } from '../../../core/auth/permissions.service';

import type { PageResponse, PagoListadoDto } from '../../../core/api/pagos/pagos.models';
import { PagosApi } from '../../../core/api/pagos/pagos.api';
import { FormsModule } from '@angular/forms';
import { ComprobanteApi } from '../../../core/api/pagos/comprobante.api';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pagos-list',
  standalone: true,
  imports: [CommonModule, Pagination, RouterLink, FormsModule],
  templateUrl: './pago-listar.html',
  styleUrl: './pago-listar.css',
})
export class PagoListar implements OnInit, OnDestroy {
  private pagosApi = inject(PagosApi);
  private comprobanteApi = inject(ComprobanteApi);
  authz = inject(PermissionsService);

  // Inputs (UI)
  qInput = signal<string>('');
  fromInput = signal<string>(''); // YYYY-MM-DD
  toInput = signal<string>(''); // YYYY-MM-DD

  // Filtros aplicados
  q = signal<string>('');
  from = signal<string>('');
  to = signal<string>('');

  pageInfo = signal<PageResponse<PagoListadoDto> | null>(null);
  loading = signal(false);

  readonly pageSize = 10;

  // ===== Modal PDF =====
  pdfModalOpen = signal(false);
  pdfLoading = signal(false);
  private sanitizer = inject(DomSanitizer);

  pdfUrl = signal<SafeResourceUrl | null>(null);

  // guarda el objectUrl real para poder hacer revoke
  private pdfObjectUrl: string | null = null;
  pdfReciboLabel = signal<string>('');

  @ViewChild('pdfIframe')
  pdfIframeRef?: ElementRef<HTMLIFrameElement>;

  ngOnInit() {
    this.cargarPagos(0);
  }

  ngOnDestroy() {
    this.cleanupPdfUrl();
  }

  // ======== filtros ========
  aplicarFiltros() {
    const from = this.fromInput();
    const to = this.toInput();
    if (from && to && from > to) return;

    this.q.set(this.qInput());
    this.from.set(this.fromInput());
    this.to.set(this.toInput());

    this.cargarPagos(0);
  }

  limpiarFiltros() {
    this.qInput.set('');
    this.fromInput.set('');
    this.toInput.set('');

    this.q.set('');
    this.from.set('');
    this.to.set('');

    this.cargarPagos(0);
  }

  onSearchEnter(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    this.aplicarFiltros();
  }

  cargarPagos(page: number) {
    this.loading.set(true);

    this.pagosApi
      .listar({
        page,
        size: this.pageSize,
        q: this.q() || undefined,
        from: this.from() || undefined,
        to: this.to() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.pageInfo.set(res);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  // ======== pagination ========
  items = computed(() => this.pageInfo()?.content ?? []);
  totalItems = computed(() => this.pageInfo()?.totalElements ?? 0);
  totalPages = computed(() => this.pageInfo()?.totalPages ?? 0);
  currentPage = computed(() => (this.pageInfo()?.number ?? 0) + 1);
  itemsPerPage = computed(() => this.pageInfo()?.size ?? this.pageSize);

  fromItem = computed(() => {
    const p = this.pageInfo();
    if (!p || p.totalElements === 0) return 0;
    return p.number * p.size + 1;
  });

  toItem = computed(() => {
    const p = this.pageInfo();
    if (!p) return 0;
    return Math.min((p.number + 1) * p.size, p.totalElements);
  });

  pagesArray = computed(() => {
    const n = this.totalPages();
    return Array.from({ length: n }, (_, i) => i + 1);
  });

  goToPage = (page1Based: number) => this.cargarPagos(page1Based - 1);

  nextPage = () => {
    const p = this.pageInfo();
    if (!p || p.last) return;
    this.cargarPagos(p.number + 1);
  };

  prevPage = () => {
    const p = this.pageInfo();
    if (!p || p.first) return;
    this.cargarPagos(p.number - 1);
  };

  // ======== modal helpers ========
  private cleanupPdfUrl() {
    if (this.pdfObjectUrl) {
      URL.revokeObjectURL(this.pdfObjectUrl);
      this.pdfObjectUrl = null;
    }
    this.pdfUrl.set(null);
  }

  abrirPopupPdf(item: PagoListadoDto) {
    const idComprobante = item.idComprobante;

    if (!Number.isFinite(idComprobante)) {
      alert('ID de comprobante inválido: ' + idComprobante);
      return;
    }

    this.pdfModalOpen.set(true);
    this.pdfLoading.set(true);
    this.pdfReciboLabel.set(item.idRecibo ?? '');

    this.cleanupPdfUrl();

    this.comprobanteApi.getComprobantePdf(idComprobante).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.pdfObjectUrl = objectUrl;

        // IMPORTANT: esto permite usarlo en <iframe [src]>
        this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl));

        this.pdfLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.pdfLoading.set(false);
        alert(err?.message ?? 'No se pudo generar el comprobante PDF.');
        this.cerrarPopupPdf();
      },
    });
  }

  cerrarPopupPdf() {
    this.pdfModalOpen.set(false);
    this.pdfLoading.set(false);
    this.cleanupPdfUrl();
  }

  imprimirDesdePopup() {
    const iframe = this.pdfIframeRef?.nativeElement;
    if (!iframe) return;

    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error(e);
      alert('No se pudo iniciar la impresión. Intenta imprimir manualmente desde el visor.');
    }
  }

  descargarPdf(item: PagoListadoDto) {
    const idComprobante = item.idComprobante;
    if (!Number.isFinite(idComprobante)) {
      alert('ID de comprobante inválido: ' + idComprobante);
      return;
    }

    this.comprobanteApi.getComprobantePdf(idComprobante).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `comprobante-${item.idRecibo || idComprobante}.pdf`;
        a.click();

        URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error(err);
        alert(err?.message ?? 'No se pudo descargar el comprobante PDF.');
      },
    });
  }

  // ======== stats (igual) ========
  private esMismaFecha(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  recaudacionHoy = computed(() => {
    const hoy = new Date();
    return this.items()
      .filter((p) => {
        const fecha = new Date(p.fechaPago);
        return this.esMismaFecha(fecha, hoy) && p.estado === 'Completado';
      })
      .reduce((acc, cur) => acc + cur.monto, 0);
  });

  pagosProcesados = computed(() => this.items().filter((p) => p.estado === 'Completado').length);

  totalMes = computed(() => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    return this.items()
      .filter((p) => {
        const fecha = new Date(p.fechaPago);
        return (
          fecha.getFullYear() === anioActual &&
          fecha.getMonth() === mesActual &&
          p.estado === 'Completado'
        );
      })
      .reduce((acc, p) => acc + p.monto, 0);
  });
}
