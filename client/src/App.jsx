import { useSocket } from './hooks/useSocket';

export default function App() {
  useSocket(); // Bas ye ek line — login hote hi connect ho jaata hai

  return (
    <AppRouter />
  );
}