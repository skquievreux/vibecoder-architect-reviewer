import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Repository Sync Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Monitor API synchronization across all private repositories
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
          </Button>
          
          <Button onClick={handleManualRefresh} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Now</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Repos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncLogs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sync Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sync Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Repository</th>
                  <th className="px-6 py-3">Framework</th>
                  <th className="px-6 py-3">API Spec</th>
                  <th className="px-6 py-3">Deployments</th>
                  <th className="px-6 py-3">Last Sync</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map((log) => (
                  <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4">
                      {log.framework ? (
                        <Badge variant="outline">
                          <Package className="h-3 w-3 mr-1" />
                          {log.framework}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={log.hasApiSpec ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {log.hasApiSpec ? '✅ Yes' : '❌ No'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {log.deployments.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {log.deployments.map((deployment) => (
                            <Badge key={deployment} variant="outline" className="text-xs">
                              <Rocket className="h-3 w-3 mr-1" />
                              {deployment}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {log.status === 'error' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetrySync(log.repositoryName)}
                            className="text-xs"
                          >
                            Retry
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          View Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {syncLogs.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No sync logs found. Repositories will appear here after first sync.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}