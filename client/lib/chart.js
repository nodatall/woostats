import 'chartjs-adapter-moment'
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
)

export const lineColors = ['#ae85de', 'rgb(221, 170, 28)']
