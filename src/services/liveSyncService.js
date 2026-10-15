// Cross-Device Instant Real-Time Synchronization Service for Beli Pharmacy
// Uses Server-Sent Events (SSE) pub/sub so updates appear instantly without page reloads across all devices

const SYNC_TOPIC = 'beli_pharmacy_live_sync_2026';
const SSE_URL = `https://ntfy.sh/${SYNC_TOPIC}/sse`;
const PUBLISH_URL = `https://ntfy.sh/${SYNC_TOPIC}`;
const POLL_URL = `https://ntfy.sh/${SYNC_TOPIC}/json?poll=1&since=all`;

/**
 * Publishes a live sync event to all connected devices in real time
 * @param {Object} event - Event payload { type, data, timestamp }
 */
export const publishLiveSync = async (event) => {
  if (!event || !event.type) return false;
  const payload = {
    ...event,
    senderId: typeof window !== 'undefined' ? (window.__beliClientId ||= Math.random().toString(36).substring(2, 9)) : 'srv',
    timestamp: Date.now()
  };

  try {
    const res = await fetch(PUBLISH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.warn('Live sync publish error:', err);
    return false;
  }
};

/**
 * Fetches recent sync events from the cloud (useful when a device is first opened)
 */
export const fetchRecentSyncEvents = async () => {
  try {
    const res = await fetch(POLL_URL, { cache: 'no-store' });
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.trim().split('\n').filter(Boolean);
    const events = [];

    for (const line of lines) {
      try {
        const item = JSON.parse(line);
        if (item.event === 'message' && item.message) {
          // If message is JSON string
          try {
            const parsed = JSON.parse(item.message);
            if (parsed && parsed.type) events.push(parsed);
          } catch {
            // If attachment
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
    console.warn('Fetch recent sync events error:', err);
    return [];
  }
};

/**
 * Subscribes to the real-time Server-Sent Events (SSE) stream
 * Fires callback instantly when any device publishes an update
 * @param {Function} onEvent - Callback handler (event) => void
 * @returns {Function} Unsubscribe function
 */
export const subscribeLiveSync = (onEvent) => {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
    return () => {};
  }

  let eventSource = null;
  let isClosed = false;
  let reconnectTimer = null;

  const myClientId = (window.__beliClientId ||= Math.random().toString(36).substring(2, 9));

  const connect = () => {
    if (isClosed) return;

    try {
      eventSource = new EventSource(SSE_URL);

      eventSource.onopen = () => {
        // Connected to real-time stream
      };

      eventSource.onmessage = async (e) => {
        if (!e.data) return;
        try {
          const wrapper = JSON.parse(e.data);
          if (wrapper.event === 'message') {
            let eventData = null;

            if (wrapper.message) {
              try {
                eventData = JSON.parse(wrapper.message);
              } catch {
                // If it was stored in attachment
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

            if (eventData && eventData.type) {
              // Ignore self-published events if needed, but allow state convergence
              onEvent(eventData);
            }
          }
        } catch (parseErr) {
          console.warn('Error handling SSE message:', parseErr);
        }
      };

      eventSource.onerror = () => {
        // SSE connection dropped, auto-reconnect after delay
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (!isClosed) {
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
    } catch (err) {
      if (!isClosed) {
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connect, 4000);
      }
    }
  };

  connect();

  return () => {
    isClosed = true;
    clearTimeout(reconnectTimer);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
};
