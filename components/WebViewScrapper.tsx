import React, { useState, useRef } from 'react';
import { Modal, View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

interface WebViewScraperProps {
  visible: boolean;
  url: string;
  username: string;
  password: string;
  onSuccess: (data: { username: string, minutes: number }) => void;
  onClose: () => void;
}

const WebViewScraper = ({ visible, url, username, password, onSuccess, onClose }: WebViewScraperProps) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // JavaScript to auto-fill and submit login form
  const injectLoginScript = `
    (function() {
      try {
        const emailInput = document.querySelector('input[type="email"], input[name="email"], input[id*="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        const loginForm = emailInput?.form || passwordInput?.form;
        
        if (emailInput && passwordInput && loginForm) {
          emailInput.value = "${username}";
          passwordInput.value = "${password}";
          loginForm.submit();
          true;
        } else {
          false;
        }
      } catch (e) {
        console.error("Login injection failed:", e);
        false;
      }
    })();
  `;

  // JavaScript to extract the username and minutes from the page
  const extractDataScript = `
    (function() {
      try {
        const pageText = document.body.innerText;
        
        // Extract username - look for "Username:" pattern
        const usernameMatch = pageText.match(/Username:\\s+([\\w]+)/i);
        
        // Extract total minutes - look for "Total Use:" pattern
        const minutesMatch = pageText.match(/Total Use:\\s+(\\d+)\\s*Minute/i);
        
        if (minutesMatch && usernameMatch) {
          // Found both username and minutes
          window.ReactNativeWebView.postMessage(JSON.stringify({
            username: usernameMatch[1],
            minutes: parseInt(minutesMatch[1], 10)
          }));
          return;
        }
        
        // If we couldn't find the exact pattern, try looking for any large number
        if (!minutesMatch) {
          const largeNumberMatch = pageText.match(/\\b([1-9]\\d{3,5})\\s*Minute\\b/);
          if (largeNumberMatch) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              username: usernameMatch ? usernameMatch[1] : "unknown",
              minutes: parseInt(largeNumberMatch[1], 10)
            }));
            return;
          }
        }
        
        // If nothing found
        window.ReactNativeWebView.postMessage(JSON.stringify({
          error: "NO_DATA_FOUND"
        }));
      } catch (e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          error: e.message
        }));
      }
    })();
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Connecting to WiFi Portal</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0061FF" />
            <Text style={styles.loadingText}>Logging in to WiFi portal...</Text>
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={onClose} style={styles.errorButton}>
              <Text style={styles.errorButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webView}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => {
            setIsLoading(false);
            
            // After page loads, check if we need to login or extract data
            webViewRef.current?.injectJavaScript(`
              (function() {
                // Check if we're on login page
                const isLoginPage = !!document.querySelector('input[type="password"]');
                
                if (isLoginPage) {
                  // We're on the login page, inject login script
                  ${injectLoginScript}
                } else {
                  // We might be on the dashboard, try to extract data
                  ${extractDataScript}
                }
              })();
            `);
          }}
          onNavigationStateChange={(navState) => {
            // When page changes, we might have logged in
            // Give it a moment to fully load
            if (!navState.url.includes('login')) {
              setTimeout(() => {
                webViewRef.current?.injectJavaScript(extractDataScript);
              }, 1000);
            }
          }}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              
              if (data.error) {
                setError(`Failed to extract data: ${data.error}`);
                return;
              }
              
              if (data.minutes && data.username) {
                onSuccess({
                  username: data.username,
                  minutes: data.minutes
                });
              } else {
                setError("Couldn't find usage data on the page");
              }
            } catch (e) {
              setError("Error parsing data from page");
            }
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 60,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Rubik',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 2,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Rubik',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#0061FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  errorButtonText: {
    color: 'white',
    fontFamily: 'Rubik-Medium',
    fontSize: 14,
  },
});

export default WebViewScraper;