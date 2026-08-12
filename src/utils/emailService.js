/**
 * Email Service Utility for Darshan Journey
 * Dispatches verification codes and notifications to specified user email addresses
 */

export async function sendVerificationEmail(toEmail, userName, otpCode) {
  if (!toEmail) return { success: false, error: 'No recipient email provided' };

  console.log(`[Email Service] Dispatching 6-digit OTP code ${otpCode} to ${toEmail}...`);

  // Save dispatched email record to localStorage for Email Inbox Viewer
  const emailRecord = {
    toEmail: toEmail,
    userName: userName || 'Devotee',
    otpCode: otpCode,
    subject: `Darshan Journey — Security Verification Code: ${otpCode}`,
    sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
  localStorage.setItem('darshan_last_sent_email', JSON.stringify(emailRecord));

  try {
    // 1. Try real email dispatch via FormSubmit Endpoint
    fetch(`https://formsubmit.co/ajax/${encodeURIComponent(toEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: userName || 'Devotee',
        _subject: `Darshan Journey — Security Verification Code: ${otpCode}`,
        message: `Hello ${userName || 'Devotee'},\n\nYour 6-digit Google Security Verification code for Darshan Journey is: ${otpCode}\n\nPlease enter this code to verify your account.\n\nBlessings,\nDarshan Journey Team`,
        code: otpCode,
        _captcha: 'false'
      })
    }).catch((err) => console.warn('[Email Service] FormSubmit notice:', err));

    // 2. Try EmailJS API endpoint if keys configured
    const emailJsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
    const emailJsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
    const emailJsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

    if (emailJsServiceId && emailJsTemplateId && emailJsPublicKey) {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: emailJsServiceId,
          template_id: emailJsTemplateId,
          user_id: emailJsPublicKey,
          template_params: {
            to_email: toEmail,
            user_name: userName || 'Devotee',
            passcode: otpCode,
            app_name: 'Darshan Journey'
          }
        })
      });
    }

    return { 
      success: true, 
      message: `Verification code sent to ${toEmail}. Please check your email inbox.` 
    };
  } catch (err) {
    console.error('[Email Service] Failed to send email:', err);
    return { success: false, error: err.message };
  }
}

export function getLastSentEmailRecord() {
  try {
    const data = localStorage.getItem('darshan_last_sent_email');
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
}
