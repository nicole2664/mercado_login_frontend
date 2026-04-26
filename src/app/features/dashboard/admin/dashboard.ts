import {
  Component,
  OnInit,
  OnDestroy,
  computed,
  inject,
  signal,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DashboardApi
} from '../../../core/api/dashboard/dashboard.api';
import { interval, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
import { shortMonthLabel } from '../../../core/utils/date-labels.utils';
import { environment } from '../../../../environments/environment';
import { DashboardResponse } from '../../../core/api/dashboard/dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('revenueChart') revenueChart!: ElementRef<HTMLCanvasElement>;
  readonly dashboard$ = signal<DashboardResponse | undefined>(undefined);
  private dashboardApi = inject(DashboardApi);

  private chart: Chart | undefined;
  private destroy$ = new Subject<void>();
  private viewReady = false;
  readonly isTabActive = signal<boolean>(true); // (POR PROBAR)

  ocupacion$ = computed(() => {
    const d = this.dashboard$();
    return d
      ? { totalPuestos: d.totalPuestos, totalAsignaciones: d.totalAsignaciones }
      : { totalPuestos: 0, totalAsignaciones: 0 };
  });

  deudaVencida$ = computed(() => {
    const d = this.dashboard$();
    return d
      ? { montoTotal: d.deudaVencidaTotal, cantidad: d.deudaVencidaCantidad }
      : { montoTotal: 0, cantidad: 0 };
  });

  ingresos$ = computed(() => {
    const d = this.dashboard$();
    return d
      ? {
          mesActual: d.mesActual,
          mesAnterior: d.mesAnterior,
          variacionPct: d.variacionPct,
          serieMensual: d.serieMensual,
        }
      : { mesActual: 0, mesAnterior: 0, variacionPct: 0, serieMensual: [] };
  });

  topDeudores$ = computed(() => this.dashboard$()?.topDeudores ?? []);

  ocupacionPct = computed(() => {
    const o = this.dashboard$();
    return o && o.totalPuestos ? Math.round((o.totalAsignaciones / o.totalPuestos) * 100) : 0;
  });

  totalMesActual = computed(() => this.dashboard$()?.mesActual ?? 0);
  variacionMesPct = computed(() => this.dashboard$()?.variacionPct ?? 0);
  serieMensual = computed(() => this.dashboard$()?.serieMensual ?? []);

  shortMonth(str: string) {
    return shortMonthLabel(str);
  }

  ngOnInit() {
    //-- VISIBILITY (POR PROBAR)
    const handleVisibility = () => this.isTabActive.set(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handleVisibility);

    //-- RXJS POLLING
    interval(10000)
      .pipe(startWith(0), takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAll();
      });

    // Limpia listener al destruir (mejor práctica):  (POR PROBAR)
    this.destroy$.subscribe(() => {
      document.removeEventListener('visibilitychange', handleVisibility);
    });
  }

  ngAfterViewInit() {
    this.viewReady = true;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart) this.chart.destroy();
  }

  private loadAll() {
    this.dashboardApi.getDashboard().subscribe({
      next: (data) => {
        this.dashboard$.set(data);
        if (this.viewReady) setTimeout(() => this.renderChart(), 0);
      },
      error: (err) => this.logError('Error cargando dashboard:', err),
    });
  }

  private renderChart() {
    if (!this.viewReady || !this.revenueChart) return;
    const ctx = this.revenueChart.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.chart) this.chart.destroy();

    const data = this.serieMensual();
    if (!data?.length) return;

    const labels = data.map((m) => this.shortMonth(m.mes));
    const totals = data.map((m) => m.total);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: totals,
            backgroundColor: '#3b82f6',
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { display: false },
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94a3b8' } },
        },
      },
    });
  }

  private logError(msg: string, err: any) {
    if (!environment.production) {
      console.error(msg, err);
    }
    // Aquí podrías enviar logs a un servicio de monitoreo si lo deseas en prod
  }
}
