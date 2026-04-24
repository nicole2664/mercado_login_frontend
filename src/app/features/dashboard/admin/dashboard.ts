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
  DashboardApi,
  DashboardDeudaVencida,
  DashboardIngresos,
  DashboardOcupacion,
  TopDeudor,
} from '../../../core/api/dashboard/dashboard.api';
import { interval, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
import { shortMonthLabel } from '../../../core/utils/date-labels.utils';
import { environment } from '../../../../environments/environment';

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

  private dashboardApi = inject(DashboardApi);

  private chart: Chart | undefined;
  private destroy$ = new Subject<void>();
  private viewReady = false;
  readonly isTabActive = signal<boolean>(true); // (POR PROBAR)

  readonly ingresos$ = signal<DashboardIngresos | undefined>(undefined);
  readonly ocupacion$ = signal<DashboardOcupacion | undefined>(undefined);
  readonly topDeudores$ = signal<TopDeudor[]>([]);
  readonly deudaVencida$ = signal<DashboardDeudaVencida | undefined>(undefined);

  readonly ocupacionPct = computed(() => {
    const o = this.ocupacion$();
    return o && o.totalPuestos ? Math.round((o.totalAsignaciones / o.totalPuestos) * 100) : 0;
  });

  readonly totalMesActual = computed(() => this.ingresos$()?.mesActual ?? 0);
  readonly variacionMesPct = computed(() => this.ingresos$()?.variacionPct ?? 0);
  readonly serieMensual = computed(() => this.ingresos$()?.serieMensual ?? []);

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
    // Refresca TODOS los datos (¡incluso los que antes cargabas solo una vez!)
    this.dashboardApi.getOcupacion().subscribe({
      next: (data) => this.ocupacion$.set(data),
      error: (err) =>
        this.logError('Error cargando ocupación:', err),
    });
    this.dashboardApi.getIngresos().subscribe({
      next: (data) => {
        this.ingresos$.set(data);
        if (this.viewReady) setTimeout(() => this.renderChart(), 0);
      },
      error: (err) => this.logError('Error cargando ingresos:', err),
    });
    this.dashboardApi.getDeudaVencida().subscribe({
      next: (data) => this.deudaVencida$.set(data),
      error: (err) => this.logError('Error deuda vencida', err),
    });
    this.dashboardApi.getTopDeudores().subscribe({
      next: (list) => this.topDeudores$.set(list),
      error: (err) => this.logError('Top deudores', err),
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
