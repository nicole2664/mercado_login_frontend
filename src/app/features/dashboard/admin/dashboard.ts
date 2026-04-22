import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewInit, PLATFORM_ID, inject, } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('revenueChart') revenueChart!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | undefined;
  private platformId = inject(PLATFORM_ID);
  viewPeriod = signal(6);

  ngOnInit() {}

  ngAfterViewInit() {
    // Solo renderizamos si estamos en el navegador para evitar errores de SSR/Vite
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.renderChart(), 0);
    }
  }

  updatePeriod(months: number) {
    this.viewPeriod.set(months);
    if (!this.chart) return;

    const data6 = [180000, 210000, 195000, 240000, 284592, 260000];
    const data12 = [140, 160, 180, 210, 195, 240, 284, 260, 275, 290, 310, 305].map(
      (v) => v * 1000,
    );

    const labels6 = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN'];
    const labels12 = [
      'JUL',
      'AGO',
      'SEP',
      'OCT',
      'NOV',
      'DIC',
      'ENE',
      'FEB',
      'MAR',
      'ABR',
      'MAY',
      'JUN',
    ];

    this.chart.data.labels = months === 6 ? labels6 : labels12;
    this.chart.data.datasets[0].data = months === 6 ? data6 : data12;
    this.chart.update();
  }

  renderChart() {
    const canvas = this.revenueChart?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destruir grafico previo si existe para evitar errores de duplicidad
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN'],
        datasets: [
          {
            data: [180000, 210000, 195000, 240000, 284592, 260000],
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
}
