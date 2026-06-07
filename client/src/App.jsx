import { useSocket } from './hooks/useSocket'
import AppRouter from './router/AppRouter'

export default function App() {
  useSocket()
  return <AppRouter />
}