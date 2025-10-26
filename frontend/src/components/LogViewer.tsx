import { memo, useEffect, useRef } from 'react';
import type { LogEntry } from '../types/webrtc';

interface LogViewerProps {
  logs: LogEntry[];
}

const LogViewer = memo<LogViewerProps>(({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs">
      {logs.map((log, index) => (
        <div key={index} className="mb-1">
          <span className="text-gray-500">[{log.timestamp}]</span>{' '}
          <span className={
            log.type === 'error' ? 'text-red-400' :
            log.type === 'warning' ? 'text-yellow-400' :
            log.type === 'success' ? 'text-green-400' :
            'text-gray-300'
          }>
            {log.message}
          </span>
        </div>
      ))}
      <div ref={logEndRef} />
    </div>
  );
});

LogViewer.displayName = 'LogViewer';

export default LogViewer;

