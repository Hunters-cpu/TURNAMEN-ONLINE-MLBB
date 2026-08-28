// Google Workspace Services: Gmail & Google Calendar Client-side API
// Conforms strictly to workspace-integration guidelines & OAuth token auth

export interface GmailMessageItem {
  id: string;
  threadId: string;
  snippet: string;
  subject?: string;
  from?: string;
  date?: string;
  bodyText?: string;
  labels?: string[];
}

export interface GoogleCalendarEventItem {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
}

// -------------------------------------------------------------
// 📧 GMAIL SERVICES
// -------------------------------------------------------------

/**
 * Fetch list of recent messages from user's Gmail
 */
export async function listGmailMessages(accessToken: string, query: string = '', maxResults: number = 10): Promise<GmailMessageItem[]> {
  try {
    const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
    url.searchParams.set('maxResults', String(maxResults));
    if (query) {
      url.searchParams.set('q', query);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gmail API Error (${res.status})`);
    }

    const data = await res.json();
    if (!data.messages || !Array.isArray(data.messages)) {
      return [];
    }

    // Fetch details for each message
    const detailedMessages: GmailMessageItem[] = [];
    for (const item of data.messages.slice(0, 8)) {
      try {
        const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          const headers = msgData.payload?.headers || [];
          const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(Tanpa Judul)';
          const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
          const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
          
          detailedMessages.push({
            id: msgData.id,
            threadId: msgData.threadId,
            snippet: msgData.snippet || '',
            subject,
            from,
            date,
            labels: msgData.labelIds || [],
          });
        }
      } catch (e) {
        console.warn('Failed to fetch single Gmail detail:', e);
      }
    }

    return detailedMessages;
  } catch (error: any) {
    console.error('listGmailMessages error:', error);
    throw error;
  }
}

/**
 * Send an email using Gmail API
 * Note: Caller MUST display confirmation dialog to user first!
 */
export async function sendGmailEmail(
  accessToken: string,
  to: string,
  subject: string,
  bodyContent: string
): Promise<{ success: boolean; id?: string }> {
  try {
    // Construct RFC 2822 email format
    const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      bodyContent,
    ];
    const message = messageParts.join('\r\n');

    // Base64url encode
    const encodedMessage = btoa(unescape(encodeURIComponent(message)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal mengirim email via Gmail API (${res.status})`);
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (error: any) {
    console.error('sendGmailEmail error:', error);
    throw error;
  }
}

// -------------------------------------------------------------
// 📅 GOOGLE CALENDAR SERVICES
// -------------------------------------------------------------

/**
 * List events from user's primary Google Calendar
 */
export async function listCalendarEvents(accessToken: string, timeMin?: string): Promise<GoogleCalendarEventItem[]> {
  try {
    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    url.searchParams.set('maxResults', '20');
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    if (timeMin) {
      url.searchParams.set('timeMin', timeMin);
    } else {
      url.searchParams.set('timeMin', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Google Calendar API Error (${res.status})`);
    }

    const data = await res.json();
    return data.items || [];
  } catch (error: any) {
    console.error('listCalendarEvents error:', error);
    throw error;
  }
}

/**
 * Add a Match / Tournament Event to Google Calendar
 * Note: Caller MUST display confirmation dialog to user first!
 */
export async function addEventToGoogleCalendar(
  accessToken: string,
  event: {
    title: string;
    description: string;
    location?: string;
    startIso: string;
    endIso: string;
  }
): Promise<{ success: boolean; event?: GoogleCalendarEventItem }> {
  try {
    const calendarEventPayload = {
      summary: event.title,
      description: event.description,
      location: event.location || 'Hunters Community Esport Arena',
      start: {
        dateTime: event.startIso,
        timeZone: 'Asia/Jakarta',
      },
      end: {
        dateTime: event.endIso,
        timeZone: 'Asia/Jakarta',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'email', minutes: 60 },
        ],
      },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calendarEventPayload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal menambahkan jadwal ke Google Calendar (${res.status})`);
    }

    const createdEvent = await res.json();
    return { success: true, event: createdEvent };
  } catch (error: any) {
    console.error('addEventToGoogleCalendar error:', error);
    throw error;
  }
}
