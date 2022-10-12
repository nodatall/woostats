import 'chartjs-adapter-date-fns'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  BarElement,
  LinearScale,
  Title,
  CategoryScale,
  TimeScale,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  LineElement,
  PointElement,
  BarElement,
  LinearScale,
  Title,
  CategoryScale,
  TimeScale,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
)

export const lineColors = ['#ae85de', 'rgb(221, 170, 28)']
