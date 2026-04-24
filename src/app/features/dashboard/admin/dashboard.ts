import {
  Component,
  OnInit,
  OnDestroy,
  computed,
  inject,
  signal,
  WritableSignal,
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

import { Chart, registerables } from 'chart.js';
import { shortMonthLabel } from '../../../core/utils/date-labels.utils';
import { environment } from '../../../../environments/environment.prod';

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
  private refreshIntervalId?: any;
  private viewReady = false;

  readonly ingresos$: WritableSignal<DashboardIngresos | undefined> = signal<
    DashboardIngresos | undefined
  >(undefined);

  readonly ocupacion$: WritableSignal<DashboardOcupacion | undefined> = signal<
    DashboardOcupacion | undefined
  >(undefined);

  readonly ocupacionPct = computed(() => {
    const o = this.ocupacion$();
    return o && o.totalPuestos ? Math.round((o.totalAsignaciones / o.totalPuestos) * 100) : 0;
  });

  readonly totalMesActual = computed(() => this.ingresos$()?.mesActual ?? 0);
  readonly variacionMesPct = computed(() => this.ingresos$()?.variacionPct ?? 0);
  readonly topDeudores$ = signal<TopDeudor[]>([]);

  readonly deudaVencida$ = signal<DashboardDeudaVencida | undefined>(undefined);

  // Serie para gráfica
  readonly serieMensual = computed(() => this.ingresos$()?.serieMensual ?? []);

  // Helper para mostrar solo mes corto y año (ej: "May 24")
  shortMonth(str: string) {
    return shortMonthLabel(str);
  }

  private renderChart() {
    if (!this.viewReady) return;
    if (!this.revenueChart) return;
    const ctx = this.revenueChart.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.chart) this.chart.destroy();

    const data = this.serieMensual();
    if (!data || data.length === 0) return;

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

  ngAfterViewInit() {
    this.viewReady = true;
    // La gráfica solo se pinta cuando los datos llegan (ver abajo)
    // y siempre después de AfterViewInit.
  }

  ngOnInit() {
    this.loadAll();
    this.loadDeudaVencida();

    this.refreshIntervalId = setInterval(() => {
      this.loadAll();
      this.loadDeudaVencida();
    }, 10000);
  }

  ngOnDestroy() {
    if (this.refreshIntervalId) clearInterval(this.refreshIntervalId);
    if (this.chart) this.chart.destroy();
  }

  private loadAll() {
    // Ambas en paralelo
    this.loadOcupacion();
    this.loadIngresos();
    this.loadTopDeudores();
  }

  private loadOcupacion() {
    this.dashboardApi.getOcupacion().subscribe({
      next: (data) => this.ocupacion$.set(data),
      error: (err) => {
        if (environment.production) {
          return;
        }
        console.error('Error cargando ocupación:', err);
      },
    });
  }

  private loadIngresos() {
    this.dashboardApi.getIngresos().subscribe({
      next: (data) => {
        this.ingresos$.set(data);
        // Solo actualiza la gráfica después del primer render del canvas
        if (this.viewReady) {
          setTimeout(() => this.renderChart(), 0);
        }
      },
      error: (err) => {
        if (environment.production) {
          return;
        }
        console.error('Error cargando ingresos:', err);
      },
    });
  }

  private loadDeudaVencida() {
    this.dashboardApi.getDeudaVencida().subscribe({
      next: (data) => this.deudaVencida$.set(data),
      error: (err) => {
        if (environment.production) {
          return;
        }
        console.error('Error deuda vencida', err);
      },
    });
  }

  private loadTopDeudores() {
    this.dashboardApi.getTopDeudores().subscribe({
      next: (list) => this.topDeudores$.set(list),
      error: (err) => {
        if (environment.production) {
          return;
        }
        console.error('Top deudores', err);
      },
    });
  }
}
