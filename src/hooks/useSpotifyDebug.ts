"use client";

import { useState, useEffect, useCallback } from 'react';

interface SpotifyDebugLog {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'auth' | 'api' | 'cookie' | 'redirect' | 'network' | 'status';
  message: string;
  details?: any;
}

interface SpotifyDebugInfo {
  // Environment info
  userAgent: string;
  platform: string;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  
  // Browser info
  cookiesEnabled: boolean;
  localStorageEnabled: boolean;
  sessionStorageEnabled: boolean;
  
  // Network info
  onlineStatus: boolean;
  connection?: any;
  
  // Auth flow tracking
  authFlowStage: 'init' | 'redirecting' | 'callback' | 'connected' | 'error';
  lastRedirectTime?: string;
  authUrlParams?: Record<string, string>;
  callbackParams?: Record<string, string>;
  
  // Cookies & Storage
  spotifyCookies: Record<string, any>;
  relevantCookies: Record<string, any>;
  
  // API responses
  lastStatusCheck?: any;
  lastTokenExchange?: any;
  
  // Errors
  errors: string[];
  
  // Connection state
  connectionAttempts: number;
  lastConnectionAttempt?: string;
}

export function useSpotifyDebug() {
  const [logs, setLogs] = useState<SpotifyDebugLog[]>([]);
  const [debugInfo, setDebugInfo] = useState<SpotifyDebugInfo | null>(null);
  const [isCollecting, setIsCollecting] = useState(true);

  // Add a new log entry
  const addLog = useCallback((
    type: SpotifyDebugLog['type'],
    category: SpotifyDebugLog['category'],
    message: string,
    details?: any
  ) => {
    if (!isCollecting) return;

    const newLog: SpotifyDebugLog = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      timestamp: new Date().toISOString(),
      type,
      category,
      message,
      details
    };

    setLogs(prev => [...prev.slice(-99), newLog]); // Keep last 100 logs
  }, [isCollecting]);

  // Collect browser and device information
  const collectBrowserInfo = useCallback(() => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);

    // Test cookies
    let cookiesEnabled = false;
    try {
      document.cookie = "test=1";
      cookiesEnabled = document.cookie.indexOf("test=1") !== -1;
      document.cookie = "test=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
    } catch (e) {
      cookiesEnabled = false;
    }

    // Test local storage
    let localStorageEnabled = false;
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      localStorageEnabled = true;
    } catch (e) {
      localStorageEnabled = false;
    }

    // Test session storage
    let sessionStorageEnabled = false;
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      sessionStorageEnabled = true;
    } catch (e) {
      sessionStorageEnabled = false;
    }

    return {
      userAgent,
      platform,
      isMobile,
      isIOS,
      isAndroid,
      cookiesEnabled,
      localStorageEnabled,
      sessionStorageEnabled,
      onlineStatus: navigator.onLine,
      connection: (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection,
    };
  }, []);

  // Get all cookies
  const getAllCookies = useCallback(() => {
    const cookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name) {
        cookies[name] = value || '';
      }
    });
    return cookies;
  }, []);

  // Get Spotify-specific cookies
  const getSpotifyCookies = useCallback(() => {
    const allCookies = getAllCookies();
    const spotifyCookies: Record<string, any> = {};
    
    Object.keys(allCookies).forEach(key => {
      if (key.includes('spotify') || key.includes('Spotify')) {
        try {
          // Try to parse JSON cookies
          spotifyCookies[key] = key.includes('user_info') ? JSON.parse(allCookies[key]) : allCookies[key];
        } catch (e) {
          spotifyCookies[key] = allCookies[key];
        }
      }
    });
    
    return spotifyCookies;
  }, [getAllCookies]);

  // Check URL parameters for auth flow tracking
  const checkUrlParams = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    
    urlParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  }, []);

  // Update debug info
  const updateDebugInfo = useCallback(() => {
    const browserInfo = collectBrowserInfo();
    const spotifyCookies = getSpotifyCookies();
    const allCookies = getAllCookies();
    const urlParams = checkUrlParams();

    // Determine auth flow stage
    let authFlowStage: SpotifyDebugInfo['authFlowStage'] = 'init';
    
    if (urlParams.spotify === 'connected') {
      authFlowStage = 'connected';
    } else if (urlParams.spotify === 'error') {
      authFlowStage = 'error';
    } else if (urlParams.code) {
      authFlowStage = 'callback';
    } else if (spotifyCookies.spotify_access_token) {
      authFlowStage = 'connected';
    }

    const info: SpotifyDebugInfo = {
      ...browserInfo,
      authFlowStage,
      authUrlParams: urlParams,
      callbackParams: urlParams.code ? urlParams : undefined,
      spotifyCookies,
      relevantCookies: allCookies,
      errors: [],
      connectionAttempts: 0,
      lastConnectionAttempt: new Date().toISOString()
    };

    setDebugInfo(info);
    
    // Log the info collection
    addLog('info', 'status', 'Debug info updated', {
      stage: authFlowStage,
      cookieCount: Object.keys(spotifyCookies).length,
      isMobile: browserInfo.isMobile
    });

    return info;
  }, [collectBrowserInfo, getSpotifyCookies, getAllCookies, checkUrlParams, addLog]);

  // Monitor URL changes (for SPA navigation)
  useEffect(() => {
    const handlePopstate = () => {
      addLog('info', 'redirect', 'URL changed (popstate)', { url: window.location.href });
      updateDebugInfo();
    };

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [addLog, updateDebugInfo]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => addLog('success', 'network', 'Device came online');
    const handleOffline = () => addLog('error', 'network', 'Device went offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addLog]);

  // Test connection function
  const testConnection = useCallback(async () => {
    addLog('info', 'network', 'Testing connection to Spotify API');
    
    try {
      const response = await fetch('/api/spotify/status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      addLog('success', 'api', 'Status API response received', {
        status: response.status,
        connected: data.connected,
        hasUser: !!data.user
      });
      
      setDebugInfo(prev => prev ? {
        ...prev,
        lastStatusCheck: {
          timestamp: new Date().toISOString(),
          status: response.status,
          data
        }
      } : null);
      
      return data;
    } catch (error) {
      addLog('error', 'api', 'Status API request failed', error);
      return null;
    }
  }, [addLog]);

  // Initiate Spotify auth
  const initiateAuth = useCallback(() => {
    addLog('info', 'auth', 'Initiating Spotify authentication');
    setDebugInfo(prev => prev ? { ...prev, authFlowStage: 'redirecting' } : null);
    
    // Add a small delay to capture the redirect
    setTimeout(() => {
      window.location.href = '/api/spotify/auth';
    }, 100);
  }, [addLog]);

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
    addLog('info', 'status', 'Debug logs cleared');
  }, [addLog]);

  // Export logs as JSON
  const exportLogs = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      debugInfo,
      logs,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `spotify-debug-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addLog('success', 'status', 'Debug logs exported');
  }, [debugInfo, logs, addLog]);

  // Initialize debug info on mount
  useEffect(() => {
    updateDebugInfo();
  }, [updateDebugInfo]);

  // Auto-refresh debug info every 5 seconds
  useEffect(() => {
    if (!isCollecting) return;
    
    const interval = setInterval(() => {
      updateDebugInfo();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isCollecting, updateDebugInfo]);

  return {
    logs,
    debugInfo,
    isCollecting,
    setIsCollecting,
    addLog,
    updateDebugInfo,
    testConnection,
    initiateAuth,
    clearLogs,
    exportLogs
  };
} 