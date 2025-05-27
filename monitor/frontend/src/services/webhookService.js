// src/services/webhookService.js

export const webhookService = {
  // Test webhook endpoint
  testWebhook: async (data = null) => {
    const testData = data || {
      test: true,
      message: 'This is a test webhook from React app',
      timestamp: new Date().toISOString(),
      _source: {
        id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        rule: {
          id: Math.floor(Math.random() * 1000) + 500,
          level: Math.floor(Math.random() * 10) + 5,
          description: 'Test security alert',
          groups: ['test', 'security_test']
        },
        agent: {
          id: '001',
          name: 'test-agent',
          ip: '192.168.1.100'
        },
        location: 'test_location',
        full_log: 'This is a test log entry for demonstration purposes',
        decoder: {
          name: 'test_decoder'
        }
      }
    };

    try {
      const response = await fetch('http://localhost:5001/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Test webhook sent successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Test webhook failed:', error);
      throw error;
    }
  },

  // Send file integrity test alert
  testFileIntegrityAlert: async () => {
    const fileIntegrityData = {
      _source: {
        id: `fim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        rule: {
          id: 550,
          level: 7,
          description: 'Integrity checksum changed.',
          groups: ['ossec', 'syscheck', 'syscheck_entry_modified', 'syscheck_file'],
          mitre: {
            technique: ['Stored Data Manipulation'],
            id: ['T1565.001'],
            tactic: ['Impact']
          }
        },
        agent: {
          id: '002',
          name: 'Windows-Test-1',
          ip: '192.168.2.145'
        },
        location: 'syscheck',
        full_log: "File '/var/www/html/index.html' modified\nMode: realtime\nChanged attributes: size,mtime,md5,sha1,sha256\nSize changed from '2048' to '2049'\nOld md5sum was: 'abc123def456'\nNew md5sum is : 'def456abc789'",
        decoder: {
          name: 'syscheck_integrity_changed'
        },
        syscheck: {
          path: '/var/www/html/index.html',
          mode: 'realtime',
          size_before: '2048',
          size_after: '2049',
          md5_before: 'abc123def456',
          md5_after: 'def456abc789',
          sha1_before: '123abc456def789',
          sha1_after: '789def456abc123',
          event: 'modified',
          changed_attributes: ['size', 'mtime', 'md5', 'sha1', 'sha256'],
          diff: '< <title>Original Title</title>\n---\n> <title>Modified Title - DEFACED!</title>'
        }
      }
    };

    return this.testWebhook(fileIntegrityData);
  },

  // Send authentication test alert
  testAuthenticationAlert: async () => {
    const authData = {
      _source: {
        id: `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        rule: {
          id: 5503,
          level: 10,
          description: 'User login failed.',
          groups: ['authentication_failed', 'pci_dss_10.2.4'],
          pci_dss: ['10.2.4'],
          nist_800_53: ['AU.14', 'AC.7']
        },
        agent: {
          id: '003',
          name: 'web-server-01',
          ip: '192.168.1.50'
        },
        location: '/var/log/auth.log',
        full_log: 'Failed password for admin from 192.168.1.200 port 22 ssh2',
        decoder: {
          name: 'sshd'
        },
        data: {
          srcip: '192.168.1.200',
          srcuser: 'admin',
          dstuser: 'admin'
        }
      }
    };

    return this.testWebhook(authData);
  },

  // Send critical test alert
  testCriticalAlert: async () => {
    const criticalData = {
      _source: {
        id: `critical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        rule: {
          id: 100001,
          level: 15,
          description: 'Multiple critical system failures detected.',
          groups: ['system_critical', 'high_priority'],
          mitre: {
            technique: ['System Shutdown/Reboot'],
            id: ['T1529'],
            tactic: ['Impact']
          }
        },
        agent: {
          id: '004',
          name: 'critical-server',
          ip: '192.168.1.10'
        },
        location: 'system_monitor',
        full_log: 'CRITICAL: Multiple system services have failed simultaneously. Potential security incident or system compromise detected.',
        decoder: {
          name: 'system_critical'
        }
      }
    };

    return this.testWebhook(criticalData);
  },

  // Get webhook server health
  getServerHealth: async () => {
    try {
      const response = await fetch('http://localhost:5001/health');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get server health:', error);
      throw error;
    }
  },

  // Get recent webhooks from API
  getRecentWebhooks: async (limit = 50) => {
    try {
      const response = await fetch(`http://localhost:5001/api/webhooks?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get recent webhooks:', error);
      throw error;
    }
  },

  // Get webhook statistics
  getStats: async () => {
    try {
      const response = await fetch('http://localhost:5001/api/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get webhook stats:', error);
      throw error;
    }
  }
};