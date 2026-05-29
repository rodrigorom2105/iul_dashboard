import { createContext, useContext, useState, type ReactNode } from 'react';

interface LiveCountContextValue {
  liveCount: number;
  setLiveCount: (n: number) => void;
}

const LiveCountContext = createContext<LiveCountContextValue>({
  liveCount: 0,
  setLiveCount: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export function useLiveCount() {
  return useContext(LiveCountContext);
}

export function LiveCountProvider({ children }: { children: ReactNode }) {
  const [liveCount, setLiveCount] = useState(0);
  return (
    <LiveCountContext.Provider value={{ liveCount, setLiveCount }}>
      {children}
    </LiveCountContext.Provider>
  );
}
