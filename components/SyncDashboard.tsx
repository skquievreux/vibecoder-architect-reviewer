import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw, GitBranch, Package, Rocket } from 'lucide-react';

interface SyncLog {
  id: string;
  repositoryId: string;
  repositoryName: string;
  status: 'success' | 'error' | 'pending';
  timestamp: string;
  framework?: string;
  hasApiSpec: boolean;
  deployments: string[];
  gitBranch?: string;
  gitCommit?: string;
  runId?: string;
  errorMessage?: string;
}

interface SyncDashboardProps {
  refreshInterval?: number; // in seconds
}

export default function SyncDashboard({ refreshInterval = 60 }: SyncDashboardProps) {
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock function - replace with actual API call
  const fetchSyncLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, return mock data - replace with actual API call
      const mockData: SyncLog[] = [
        {
          id: '1',
          repositoryId: 'repo-1',
          repositoryName: 'skquievreux/DevVault',
          status: 'success',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          framework: 'TypeScript',
          hasApiSpec: true,
          deployments: ['Vercel'],
          gitBranch: 'main',
          gitCommit: 'abc123',
          runId: 'run-123'
        },
        {
          id: '2',
          repositoryId: 'repo-2',
          repositoryName: 'skquievreux/leadmagnet-quiz-mitochondrien',
          status: 'error',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          framework: 'JavaScript',
          hasApiSpec: false,
          deployments: [],
          errorMessage: 'Failed to extract package.json'
        },
        // Add more mock entries as needed
      ];
      
      setSyncLogs(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sync logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncLogs();

    let interval: NodeJS.Timeout;
    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(fetchSyncLogs, refreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const getStatusIcon = (status: SyncLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: SyncLog['status']) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded";
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`${baseClasses} ${variants[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleManualRefresh = () => {
    fetchSyncLogs();
  };

  const handleRetrySync = async (repositoryName: string) => {
    // Implement retry logic - call GitHub API to trigger workflow
    try {
      console.log(`Retrying sync for ${repositoryName}`);
      // TODO: Implement actual retry via GitHub API
      alert(`Retrying sync for ${repositoryName}. This feature is not yet implemented.`);
    } catch (err) {
      console.error('Failed to retry sync:', err);
    }
  };

  if (loading && syncLogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading sync logs...</span>
      </div>
    );
  }

  const successCount = syncLogs.filter(log => log.status === 'success').length;
  const errorCount = syncLogs.filter(log => log.status === 'error').length;
  const pendingCount = syncLogs.filter(log => log.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Repository Sync Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Monitor API synchronization across all private repositories
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span className="text-sm">Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
          </button>
          
          <button onClick={handleManualRefresh} className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm">Refresh Now</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Repos</h3>
          <div className="text-3xl font-bold text-gray-900">{syncLogs.length}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Successful</h3>
          <div className="text-3xl font-bold text-green-600">{successCount}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Errors</h3>
          <div className="text-3xl font-bold text-red-600">{errorCount}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pending</h3>
          <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Sync Logs Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Sync Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Repository</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Framework</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">API Spec</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Deployments</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sync</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {syncLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.status)}
                      {getStatusBadge(log.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{log.repositoryName}</div>
                      {log.gitBranch && (
                        <div className="text-xs text-gray-500 flex items-center">
                          <GitBranch className="h-3 w-3 mr-1" />
                          {log.gitBranch}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.framework ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Package className="h-3 w-3 mr-1" />
                        {log.framework}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.hasApiSpec ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {log.hasApiSpec ? '✅ Yes' : '❌ No'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {log.deployments.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {log.deployments.map((deployment) => (
                          <span key={deployment} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <Rocket className="h-3 w-3 mr-1" />
                            {deployment}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {log.status === 'error' && (
                        <button
                          onClick={() => handleRetrySync(log.repositoryName)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Retry
                        </button>
                      )}
                      <button className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {syncLogs.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-500">No sync logs found.</div>
              <div className="text-gray-400 text-sm mt-2">Repositories will appear here after first sync.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}