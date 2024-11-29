import React from 'react';
import { AmazonCredentialsStorage } from '../components/amazon/AmazonCredentialsStorage';
import { AmazonConnectionStatus } from '../components/settings/AmazonConnectionStatus';
import { SingleEANLookup } from '../components/ean/SingleEANLookup';
import { ApiSettings } from '../components/settings/ApiSettings';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your Amazon Seller API credentials and API settings.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Amazon Seller API Credentials
        </h2>
        <div className="space-y-6">
          <AmazonConnectionStatus />
          <AmazonCredentialsStorage />
        </div>
      </div>

      <SingleEANLookup />

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          API Settings
        </h2>
        <ApiSettings />
      </div>
    </div>
  );
};