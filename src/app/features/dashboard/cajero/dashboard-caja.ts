import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';

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
  private platformId = inject(PLATFORM_ID);
  private chart: Chart | undefined;
  // Signals dinámicos
  recaudacionHoy = signal('S/ 4,250.00');
  transaccionesTurno = signal('24');
  alertasPendientes = signal('3');

  porcentajeRecaudacion = signal('65%');
  porcentajeTransacciones = signal('40%');
  porcentajeAlertas = signal('85%');

  ngOnInit() {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.renderChart(), 0);
    }
  }

  renderChart() {
    const canvas = this.revenueChart?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'],
        datasets: [
          {
            label: 'Recaudación Diaria',
            data: [4200, 5800, 4900, 7200, 8100, 3500, 2100],
            // CAMBIO A COLOR ESMERALDA
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
}
