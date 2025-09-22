// frontend/components/EmailStatusBadge.js

import React from 'react';
import { Mail, MailCheck, MailX, AlertCircle } from 'lucide-react';

const EmailStatusBadge = ({ emailSent, status, type = 'general' }) => {
  if (!emailSent) return null;

  const getEmailConfig = () => {
    switch (type) {
      case 'created':
        return {
          icon: Mail,
          text: 'Email Gönderildi',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200'
        };
      case 'approved':
        return {
          icon: MailCheck,
          text: 'Onay Emaili Gönderildi',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      case 'rejected':
        return {
          icon: MailX,
          text: 'Red Emaili Gönderildi',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200'
        };
      case 'reminder':
        return {
          icon: AlertCircle,
          text: 'Hatırlatma Gönderildi',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200'
        };
      default:
        return {
          icon: Mail,
          text: 'Email Gönderildi',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getEmailConfig();
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
      <IconComponent size={12} />
      {config.text}
    </span>
  );
};

export default EmailStatusBadge;