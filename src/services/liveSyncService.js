// Cross-Device & Cross-Tab Instant Real-Time Synchronization Service for Beli Pharmacy
// 1. Instant zero-latency cross-tab sync via standard HTML5 BroadcastChannel API (0ms delay!)
// 2. Local window event bus via CustomEvent for immediate in-page reactivity
// 3. Resilient cloud relay with timeout guards for cross-device synchronization

const SYNC_TOPIC = 'beli_pharmacy_live_sync_2026';
const BROADCAST_CHANNEL_NAME = 'beli_pharmacy_channel';
const SSE_URL = `https://ntfy.sh/${SYNC_TOPIC}/sse`;
const PUBLISH_URL = `https://ntfy.sh/${SYNC_TOPIC}`;
const POLL_URL = `https://ntfy.sh/${SYNC_TOPIC}/json?poll=1&since=all`;

// Dedicated HTML5 BroadcastChannel instance (supported in all modern desktop & mobile browsers)
let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (err) {
    console.warn('[Beli Sync] BroadcastChannel initialization warning:', err);
  }
}

/**
 * Publishes a live sync event to all open tabs and connected devices in real time
 * @param {Object} event - Event payload { type, ...data }
 */
export const publishLiveSync = async (event) => {
  if (!event || !event.type) return false;
  
  const payload = {
    ...event,
    senderId: typeof window !== 'undefined' ? (window.__beliClientId ||= Math.random().toString(36).substring(2, 9)) : 'srv',
    timestamp: Date.now()
  };

  // 1. Instant zero-latency sync to ALL other tabs/windows in the same browser (Admin <-> User site)
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(payload);
    } catch (e) {
      console.warn('[Beli Sync] BroadcastChannel post error:', e);
    }
  }

  // 2. Dispatch custom in-window event
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('beli_live_sync_event', { detail: payload }));
    } catch (e) {}
  }

  // 3. Non-blocking cloud relay for cross-device support (with timeout guard so it never hangs)
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 2500) : null;

    fetch(PUBLISH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    })
      .then(() => {
        if (timeoutId) clearTimeout(timeoutId);
      })
      .catch(() => {
        if (timeoutId) clearTimeout(timeoutId);
      });
  } catch (err) {
    // Non-blocking fallback
  }

  return true;
};

/**
 * Fetches recent sync events from the cloud (useful when a device is first opened)
 */
export const fetchRecentSyncEvents = async () => {
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 3000) : null;

    const res = await fetch(POLL_URL, { 
      cache: 'no-store',
      signal: controller ? controller.signal : undefined 
    });
    if (timeoutId) clearTimeout(timeoutId);
    if (!res.ok) return [];
    
    const text = await res.text();
    const lines = text.trim().split('\n').filter(Boolean);
    const events = [];

    for (const line of lines) {
      try {
        const item = JSON.parse(line);
        if (item.event === 'message' && item.message) {
          try {
            const parsed = JSON.parse(item.message);
            if (parsed && parsed.type) events.push(parsed);
          } catch {
            if (item.attachment?.url) {
              try {
                const attRes = await fetch(item.attachment.url);
                if (attRes.ok) {
                  const attData = await attRes.json();
                  if (attData && attData.type) events.push(attData);
                }
              } catch {}
            }
          }
        }
      } catch {}
    }
    return events;
  } catch (err) {
    return [];
  }
};

/**
 * Subscribes to real-time events across tabs and devices
 * Fires callback instantly when any tab or device publishes an update
 * @param {Function} onEvent - Callback handler (event) => void
 * @returns {Function} Unsubscribe function
 */
export const subscribeLiveSync = (onEvent) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let eventSource = null;
  let isClosed = false;
  let reconnectTimer = null;
  let retryCount = 0;

  const myClientId = (window.__beliClientId ||= Math.random().toString(36).substring(2, 9));

  // 1. Instant tab-to-tab listener via HTML5 BroadcastChannel (0ms delay)
  const handleBroadcastMessage = (e) => {
    if (isClosed || !e || !e.data) return;
    const data = e.data;
    if (data && data.type && data.senderId !== myClientId) {
      try {
        onEvent(data);
      } catch (err) {
        console.warn('[Beli Sync] Error handling broadcast message:', err);
      }
    }
  };

  if (broadcastChannel) {
    try {
      broadcastChannel.addEventListener('message', handleBroadcastMessage);
    } catch (e) {}
  }

  // 2. Local window event listener
  const handleLocalEvent = (e) => {
    if (isClosed || !e || !e.detail) return;
    const data = e.detail;
    if (data && data.type && data.senderId !== myClientId) {
      try {
        onEvent(data);
      } catch (err) {}
    }
  };

  window.addEventListener('beli_live_sync_event', handleLocalEvent);

  // 3. Cloud SSE Stream for cross-device support (with exponential backoff protection)
  const connectSSE = () => {
    if (isClosed || typeof EventSource === 'undefined') return;

    try {
      eventSource = new EventSource(SSE_URL);

      eventSource.onopen = () => {
        retryCount = 0;
      };

      eventSource.onmessage = async (e) => {
        if (!e.data || isClosed) return;
        try {
          const wrapper = JSON.parse(e.data);
          if (wrapper.event === 'message') {
            let eventData = null;

            if (wrapper.message) {
              try {
                eventData = JSON.parse(wrapper.message);
              } catch {
                if (wrapper.attachment?.url) {
                  try {
                    const attRes = await fetch(wrapper.attachment.url);
                    if (attRes.ok) {
                      eventData = await attRes.json();
                    }
                  } catch {}
                }
              }
            }

            if (eventData && eventData.type && eventData.senderId !== myClientId) {
              onEvent(eventData);
            }
          }
        } catch (parseErr) {}
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (!isClosed) {
          retryCount++;
          // Exponential backoff: 5s, 10s, 20s up to 60s max to prevent network spam
          const delay = Math.min(60000, 5000 * Math.pow(1.5, Math.min(retryCount, 6)));
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(connectSSE, delay);
        }
      };
    } catch (err) {
      if (!isClosed) {
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connectSSE, 10000);
      }
    }
  };

  // Launch cloud SSE non-blockingly
  try {
    connectSSE();
  } catch (e) {}

  return () => {
    isClosed = true;
    clearTimeout(reconnectTimer);
    if (broadcastChannel) {
      try {
        broadcastChannel.removeEventListener('message', handleBroadcastMessage);
      } catch (e) {}
    }
    window.removeEventListener('beli_live_sync_event', handleLocalEvent);
    if (eventSource) {
      try {
        eventSource.close();
      } catch (e) {}
      eventSource = null;
    }
  };
};
