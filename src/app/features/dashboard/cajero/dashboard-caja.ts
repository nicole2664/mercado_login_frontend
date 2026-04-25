import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
  effect,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { DashboardCajaApi } from '../../../core/api/dashboard/cajero/dashboard-caja.api';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-cajero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-caja.html',
  styleUrl: './dashboard-caja.css',
})
export class DashboardCajaComponent implements OnInit, AfterViewInit {
  @ViewChild('revenueChart') revenueChart!: ElementRef<HTMLCanvasElement>;

  private api = inject(DashboardCajaApi);
  private chart: Chart | undefined;

  dashboard = this.api.dashboardCajaSignal;

  private viewReady = signal(false);

  private chartEffect = effect(() => {
    if (!this.viewReady()) return;
    const data = this.dashboard()?.ingresosSemana ?? [];
    if (this.revenueChart && data?.length) {
      console.log('Renderizando gráfico con:', data);
      this.renderChart(data);
    }
  });

  ngOnInit() {
    this.api.fetchDashboardCajaSignal();
  }

  ngAfterViewInit() {
    this.viewReady.set(true);
  }

  renderChart(data: { dia: string; total: number }[]) {
    const canvas = this.revenueChart.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (this.chart) this.chart.destroy();

    const labels = data.map((d) => d.dia);
    const totals = data.map((d) => d.total);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Recaudación Diaria',
            data: totals,
            backgroundColor: (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) return '#10b981';
              const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
              gradient.addColorStop(0, '#34d399');
              gradient.addColorStop(1, '#059669');
              return gradient;
            },
            borderRadius: 12,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#e2e8f0' },
            ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } },
          },
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 10, weight: 'bold' } },
          },
        },
      },
    });
  }

  // Helpers: puedes irlos extendiendo a medida que avanzas
  recaudacionHoy() {
    return this.dashboard()?.recaudacionHoy ?? 0;
  }
  transaccionesTurno() {
    return this.dashboard()?.transaccionesHoy ?? 0;
  }
  alertasPendientes() {
    return this.dashboard()?.alertasPendientes ?? 0;
  }
  pagosRecientes() {
    // Devuelve los 5 más recientes (si hay menos, trae los que existan)
    return this.dashboard()?.pagosRecientes?.slice(0, 5) ?? [];
  }
}
