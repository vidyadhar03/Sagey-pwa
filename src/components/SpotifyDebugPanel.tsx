"use client";

import React, { useState } from 'react';
import { useSpotifyDebug } from '../hooks/useSpotifyDebug';

export default function SpotifyDebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'cookies' | 'network'>('overview');
  
  const debugData = useSpotifyDebug();

  if (!debugData) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => console.log('Debug hook not available')}
          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all"
          title="Debug panel error"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </button>
      </div>
    );
  }
  
  const {
    logs,
    debugInfo,
    isCollecting,
    setIsCollecting,
    addLog,
    testConnection,
    initiateAuth,
    clearLogs,
    exportLogs
  } = debugData;

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auth': return 'bg-purple-500/20 text-purple-300';
      case 'api': return 'bg-blue-500/20 text-blue-300';
      case 'cookie': return 'bg-orange-500/20 text-orange-300';
      case 'redirect': return 'bg-green-500/20 text-green-300';
      case 'network': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getAuthStageColor = (stage: string) => {
    switch (stage) {
      case 'connected': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'redirecting': return 'text-yellow-400';
      case 'callback': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-[#1DB954] hover:bg-[#1ed760] text-white p-3 rounded-full shadow-lg transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <h2 className="text-xl font-bold text-white">Spotify Debug Panel</h2>
            </div>
            {debugInfo && (
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${getAuthStageColor(debugInfo.authFlowStage)}`}>
                  {debugInfo.authFlowStage.toUpperCase()}
                </span>
                {debugInfo.isMobile && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                    {debugInfo.isIOS ? 'iOS' : debugInfo.isAndroid ? 'Android' : 'Mobile'}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCollecting(!isCollecting)}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                isCollecting 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-gray-500/20 text-gray-300'
              }`}
            >
              {isCollecting ? 'Collecting' : 'Paused'}
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'logs', label: `Logs (${logs.length})`, icon: '📝' },
            { id: 'cookies', label: 'Cookies', icon: '🍪' },
            { id: 'network', label: 'Network', icon: '🌐' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-[#1DB954] border-b-2 border-[#1DB954]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'overview' && (
            <div className="p-4 space-y-4 h-full overflow-y-auto">
              {debugInfo && (
                <>
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                      onClick={testConnection}
                      className="p-3 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-sm"
                    >
                      Test Connection
                    </button>
                    <button
                      onClick={initiateAuth}
                      className="p-3 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-all text-sm"
                    >
                      Start Auth
                    </button>
                    <button
                      onClick={clearLogs}
                      className="p-3 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-all text-sm"
                    >
                      Clear Logs
                    </button>
                    <button
                      onClick={exportLogs}
                      className="p-3 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all text-sm"
                    >
                      Export
                    </button>
                  </div>

                  {/* Device Info */}
                  <div className="bg-[#2A2A2D] rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3">Device Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Platform</div>
                        <div className="text-white">{debugInfo.platform}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Mobile</div>
                        <div className={debugInfo.isMobile ? 'text-green-400' : 'text-gray-400'}>
                          {debugInfo.isMobile ? 'Yes' : 'No'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Cookies Enabled</div>
                        <div className={debugInfo.cookiesEnabled ? 'text-green-400' : 'text-red-400'}>
                          {debugInfo.cookiesEnabled ? 'Yes' : 'No'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Online Status</div>
                        <div className={debugInfo.onlineStatus ? 'text-green-400' : 'text-red-400'}>
                          {debugInfo.onlineStatus ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Auth Flow Status */}
                  <div className="bg-[#2A2A2D] rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3">Authentication Flow</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Current Stage</span>
                        <span className={`font-medium ${getAuthStageColor(debugInfo.authFlowStage)}`}>
                          {debugInfo.authFlowStage.toUpperCase()}
                        </span>
                      </div>
                      
                      {debugInfo.authUrlParams && Object.keys(debugInfo.authUrlParams).length > 0 && (
                        <div>
                          <div className="text-gray-400 mb-2">URL Parameters</div>
                          <div className="space-y-1">
                            {Object.entries(debugInfo.authUrlParams).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-400">{key}</span>
                                <span className="text-white font-mono text-xs break-all max-w-[200px]">
                                  {value.length > 20 ? `${value.substring(0, 20)}...` : value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Spotify Cookies</span>
                        <span className="text-white">
                          {Object.keys(debugInfo.spotifyCookies).length} found
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Last Status Check */}
                  {debugInfo.lastStatusCheck && (
                    <div className="bg-[#2A2A2D] rounded-xl p-4">
                      <h3 className="text-white font-medium mb-3">Last Status Check</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Timestamp</span>
                          <span className="text-white">
                            {formatTimestamp(debugInfo.lastStatusCheck.timestamp)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status Code</span>
                          <span className="text-white">{debugInfo.lastStatusCheck.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Connected</span>
                          <span className={debugInfo.lastStatusCheck.data.connected ? 'text-green-400' : 'text-red-400'}>
                            {debugInfo.lastStatusCheck.data.connected ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="h-full overflow-y-auto">
              <div className="p-4 space-y-2">
                {logs.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    No logs yet. Logs will appear as you interact with Spotify authentication.
                  </div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="bg-[#2A2A2D] rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span>{getLogTypeIcon(log.type)}</span>
                          <span className={`text-sm font-medium ${getLogTypeColor(log.type)}`}>
                            {log.type.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(log.category)}`}>
                            {log.category}
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <div className="text-white text-sm">{log.message}</div>
                      {log.details && (
                        <details className="text-gray-300 text-xs">
                          <summary className="cursor-pointer text-gray-400 hover:text-white">
                            Details
                          </summary>
                          <pre className="mt-2 p-2 bg-black/20 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="p-4 h-full overflow-y-auto">
              {debugInfo && (
                <div className="space-y-4">
                  <div className="bg-[#2A2A2D] rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3">Spotify Cookies</h3>
                    {Object.keys(debugInfo.spotifyCookies).length === 0 ? (
                      <div className="text-gray-400">No Spotify cookies found</div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(debugInfo.spotifyCookies).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <div className="text-gray-400 text-sm">{key}</div>
                            <div className="text-white text-xs font-mono bg-black/20 p-2 rounded break-all">
                              {typeof value === 'object' ? JSON.stringify(value, null, 2) : value.toString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-[#2A2A2D] rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3">All Cookies</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {Object.entries(debugInfo.relevantCookies).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm border-b border-white/5 pb-2">
                          <span className="text-gray-400">{key}</span>
                          <span className="text-white font-mono text-xs max-w-[200px] truncate">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'network' && (
            <div className="p-4 h-full overflow-y-auto">
              {debugInfo && (
                <div className="space-y-4">
                  <div className="bg-[#2A2A2D] rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3">Network Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Online Status</span>
                        <span className={debugInfo.onlineStatus ? 'text-green-400' : 'text-red-400'}>
                          {debugInfo.onlineStatus ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      {debugInfo.connection && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Connection Type</span>
                            <span className="text-white">{debugInfo.connection.effectiveType || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Downlink</span>
                            <span className="text-white">{debugInfo.connection.downlink || 'Unknown'} Mbps</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">RTT</span>
                            <span className="text-white">{debugInfo.connection.rtt || 'Unknown'} ms</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#2A2A2D] rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3">User Agent</h3>
                    <div className="text-white text-xs font-mono bg-black/20 p-3 rounded break-all">
                      {debugInfo.userAgent}
                    </div>
                  </div>

                  <div className="bg-[#2A2A2D] rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3">Current URL</h3>
                    <div className="text-white text-xs font-mono bg-black/20 p-3 rounded break-all">
                      {typeof window !== 'undefined' ? window.location.href : 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 