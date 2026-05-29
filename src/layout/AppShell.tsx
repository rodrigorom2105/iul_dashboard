import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { LiveCountProvider } from './LiveCountContext';

export default function AppShell() {
  return (
    <LiveCountProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <Outlet />
        </div>
      </div>
    </LiveCountProvider>
  );
}
