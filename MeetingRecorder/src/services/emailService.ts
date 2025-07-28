import * as MailComposer from 'expo-mail-composer';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Meeting } from '../types';

interface EmailOptions {
  recipients: string[];
  subject: string;
  body: string;
  attachments?: string[];
}

class EmailService {
  async isAvailable(): Promise<boolean> {
    return await MailComposer.isAvailableAsync();
  }

  async sendMeetingMinutes(meeting: Meeting, recipients: string[]): Promise<boolean> {
    try {
      const isMailAvailable = await this.isAvailable();
      
      if (!isMailAvailable) {
        // Fallback to sharing if mail is not available
        return await this.shareMeetingMinutes(meeting);
      }

      const emailBody = this.formatMeetingMinutes(meeting);
      const subject = `Meeting Minutes - ${meeting.title}`;

      const options: MailComposer.MailComposerOptions = {
        recipients,
        subject,
        body: emailBody,
        isHtml: true,
      };

      // Attach audio file if it exists and is accessible
      if (meeting.audioUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(meeting.audioUri);
          if (fileInfo.exists) {
            options.attachments = [meeting.audioUri];
          }
        } catch (error) {
          console.warn('Could not attach audio file:', error);
        }
      }

      const result = await MailComposer.composeAsync(options);
      return result.status === MailComposer.MailComposerStatus.SENT;
      
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendCustomEmail(options: EmailOptions): Promise<boolean> {
    try {
      const isMailAvailable = await this.isAvailable();
      
      if (!isMailAvailable) {
        throw new Error('Email is not available on this device');
      }

      const mailOptions: MailComposer.MailComposerOptions = {
        recipients: options.recipients,
        subject: options.subject,
        body: options.body,
        isHtml: true,
      };

      if (options.attachments && options.attachments.length > 0) {
        mailOptions.attachments = options.attachments;
      }

      const result = await MailComposer.composeAsync(mailOptions);
      return result.status === MailComposer.MailComposerStatus.SENT;
      
    } catch (error) {
      console.error('Error sending custom email:', error);
      return false;
    }
  }

  async shareMeetingMinutes(meeting: Meeting): Promise<boolean> {
    try {
      const isShareAvailable = await Sharing.isAvailableAsync();
      
      if (!isShareAvailable) {
        throw new Error('Sharing is not available on this device');
      }

      // Create a text file with meeting minutes
      const meetingMinutes = this.formatMeetingMinutesPlainText(meeting);
      const fileName = `meeting-minutes-${meeting.id}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, meetingMinutes);
      
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: `Share Meeting Minutes - ${meeting.title}`,
      });

      // Clean up the temporary file
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      
      return true;
    } catch (error) {
      console.error('Error sharing meeting minutes:', error);
      return false;
    }
  }

  private formatMeetingMinutes(meeting: Meeting): string {
    const date = new Date(meeting.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const duration = this.formatDuration(meeting.duration);
    
    let locationInfo = '';
    if (meeting.location) {
      locationInfo = `
        <p><strong>Location:</strong> ${meeting.location.address || meeting.location.city || 'Unknown'}</p>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; }
          .content { margin: 20px 0; }
          .transcription { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #007AFF; }
          .translation { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Meeting Minutes</h1>
          <h2>${meeting.title}</h2>
        </div>
        
        <div class="content">
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Duration:</strong> ${duration}</p>
          ${locationInfo}
          
          ${meeting.transcription ? `
            <div class="transcription">
              <h3>Transcription (${meeting.originalLanguage.toUpperCase()})</h3>
              <p>${meeting.transcription}</p>
            </div>
          ` : ''}
          
          ${meeting.translation ? `
            <div class="translation">
              <h3>Translation (${meeting.targetLanguage?.toUpperCase()})</h3>
              <p>${meeting.translation}</p>
            </div>
          ` : ''}
        </div>
        
        <div style="margin-top: 30px; font-size: 12px; color: #666;">
          <p>Generated by Meeting Recorder App</p>
        </div>
      </body>
      </html>
    `;
  }

  private formatMeetingMinutesPlainText(meeting: Meeting): string {
    const date = new Date(meeting.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const duration = this.formatDuration(meeting.duration);
    
    let locationInfo = '';
    if (meeting.location) {
      locationInfo = `Location: ${meeting.location.address || meeting.location.city || 'Unknown'}\n`;
    }

    let content = `MEETING MINUTES
===============

Title: ${meeting.title}
Date: ${date}
Duration: ${duration}
${locationInfo}
`;

    if (meeting.transcription) {
      content += `
TRANSCRIPTION (${meeting.originalLanguage.toUpperCase()})
${'-'.repeat(40)}
${meeting.transcription}
`;
    }

    if (meeting.translation) {
      content += `
TRANSLATION (${meeting.targetLanguage?.toUpperCase()})
${'-'.repeat(40)}
${meeting.translation}
`;
    }

    content += `

Generated by Meeting Recorder App`;

    return content;
  }

  private formatDuration(durationMs: number): string {
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

export const emailService = new EmailService();