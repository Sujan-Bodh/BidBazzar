import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const Profile = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfileData();
  }, [isAuthenticated, navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setProfileData(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfileData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else if (name.startsWith('billingAddress.')) {
      const addressField = name.split('.')[1];
      setProfileData((prev) => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value,
        },
      }));
    } else if (name.startsWith('notificationPreferences.')) {
      const prefField = name.split('.')[1];
      setProfileData((prev) => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [prefField]: type === 'checkbox' ? checked : value,
        },
      }));
    } else if (name.startsWith('privacySettings.')) {
      const prefField = name.split('.')[1];
      setProfileData((prev) => ({
        ...prev,
        privacySettings: {
          ...prev.privacySettings,
          [prefField]: type === 'checkbox' ? checked : value,
        },
      }));
    } else if (name.startsWith('shippingPreferences.')) {
      const prefField = name.split('.')[1];
      setProfileData((prev) => ({
        ...prev,
        shippingPreferences: {
          ...prev.shippingPreferences,
          [prefField]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Prepare data to send (exclude verified fields)
      const dataToUpdate = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        address: profileData.address,
        billingAddress: profileData.billingAddress,
        profilePhoto: profileData.profilePhoto,
        avatar: profileData.avatar,
        notificationPreferences: profileData.notificationPreferences,
        privacySettings: profileData.privacySettings,
        language: profileData.language,
        currency: profileData.currency,
        shippingPreferences: profileData.shippingPreferences,
      };

      const response = await authAPI.updateProfile(dataToUpdate);
      setProfileData(response.data);

      // Update auth context
      await updateUser(response.data);

      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setPasswordLoading(true);

      await authAPI.updateProfile({
        currentPassword,
        password: newPassword,
      });

      toast.success('Password updated successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update password';
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  

  if (loading && !profileData) {
    return <LoadingSpinner fullScreen />;
  }

  if (!profileData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-2">Manage your account and preferences</p>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className={`${editing ? 'btn-secondary' : 'btn-primary'}`}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Member since {new Date(profileData.createdAt).toLocaleDateString()}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profileData.membershipLevel === 'premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
              {profileData.membershipLevel?.toUpperCase()} Member
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 mb-8 rounded-t-lg">
          <div className="flex flex-wrap gap-0 overflow-x-auto">
            {[
              { id: 'personal', label: '👤 Personal', icon: '👤' },
              { id: 'account', label: '🔐 Account Status', icon: '🔐' },
              { id: 'buying', label: '🛒 Buying', icon: '🛒' },
              { id: 'selling', label: '🏷️ Selling', icon: '🏷️' },
              { id: 'financial', label: '💳 Financial', icon: '💳' },
              { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
              { id: 'security', label: '🔒 Security', icon: '🔒' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* PERSONAL INFORMATION TAB */}
          {activeTab === 'personal' && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>

              {/* Profile Photo */}
              <div className="mb-6 pb-6 border-b">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo URL
                </label>
                <input
                  type="text"
                  name="profilePhoto"
                  value={profileData.profilePhoto || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`input-field ${!editing && 'bg-gray-100 cursor-not-allowed'}`}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className={`input-field ${!editing && 'bg-gray-100 cursor-not-allowed'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className={`input-field ${!editing && 'bg-gray-100 cursor-not-allowed'}`}
                  />
                </div>
              </div>

              {/* Verified Fields */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-900 mb-4">✓ Verified Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-green-600 uppercase font-semibold mb-1">Email</p>
                    <p className="text-sm text-green-900 font-medium">{profileData.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 uppercase font-semibold mb-1">Username</p>
                    <p className="text-sm text-green-900 font-medium">@{profileData.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 uppercase font-semibold mb-1">Phone</p>
                    <p className="text-sm text-green-900 font-medium">{profileData.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <input type="text" name="address.street" value={profileData.address?.street || ''} onChange={handleInputChange} disabled={!editing} className={`input-field ${!editing && 'bg-gray-100'}`} placeholder="Street" />
                  <input type="text" name="address.city" value={profileData.address?.city || ''} onChange={handleInputChange} disabled={!editing} className={`input-field ${!editing && 'bg-gray-100'}`} placeholder="City" />
                  <input type="text" name="address.state" value={profileData.address?.state || ''} onChange={handleInputChange} disabled={!editing} className={`input-field ${!editing && 'bg-gray-100'}`} placeholder="State" />
                  <input type="text" name="address.zipCode" value={profileData.address?.zipCode || ''} onChange={handleInputChange} disabled={!editing} className={`input-field ${!editing && 'bg-gray-100'}`} placeholder="ZIP Code" />
                </div>
                <input type="text" name="address.country" value={profileData.address?.country || ''} onChange={handleInputChange} disabled={!editing} className={`input-field ${!editing && 'bg-gray-100'}`} placeholder="Country" />
              </div>

              {/* Billing Address */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <input type="text" name="billingAddress.street" value={profileData.billingAddress?.street || ''} onChange={handleInputChange} disabled={!editing} className={`input-field ${!editing && 'bg-gray-100'}`} placeholder="Street" />
                  <input type="text" name="billingAddress.city" value={profileData.billingAddress?.city || ''} onChange={handleInputChange} disabled={!editing} className={`input-field ${!editing && 'bg-gray-100'}`} placeholder="City" />
                  <input type="text" name="billingAddress.state" value={profileData.billingAddress?.state || ''} onChange={handleInputChange} disabled={!editing} className={`input-field ${!editing && 'bg-gray-100'}`} placeholder="State" />
                  <input type="text" name="billingAddress.zipCode" value={profileData.billingAddress?.zipCode || ''} onChange={handleInputChange} disabled={!editing} className={`input-field ${!editing && 'bg-gray-100'}`} placeholder="ZIP Code" />
                </div>
                <input type="text" name="billingAddress.country" value={profileData.billingAddress?.country || ''} onChange={handleInputChange} disabled={!editing} className={`input-field ${!editing && 'bg-gray-100'}`} placeholder="Country" />
              </div>
            </div>
          )}

          {/* ACCOUNT STATUS TAB */}
          {activeTab === 'account' && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Account Status & Verification</h2>

              <div className="space-y-4">
                {/* Email Verification */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Email Verification</p>
                      <p className="text-sm text-gray-600">✓ {profileData.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profileData.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {profileData.isEmailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Account Active */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Account Status</p>
                      <p className="text-sm text-gray-600">Current account activation status</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profileData.accountActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {profileData.accountActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* ID Verification */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">ID Verification</p>
                      <p className="text-sm text-gray-600">Government-issued ID</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profileData.idVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {profileData.idVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>

                {/* KYC Verification */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">KYC Verification</p>
                      <p className="text-sm text-gray-600">Know Your Customer verification</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profileData.kycVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {profileData.kycVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>

                {/* Membership Level */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Membership Level</p>
                      <p className="text-sm text-gray-600">Current tier</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profileData.membershipLevel === 'premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {profileData.membershipLevel?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BUYING INFORMATION TAB */}
          {activeTab === 'buying' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Buying Activity</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary-600">{profileData.watchlist?.length || 0}</p>
                    <p className="text-sm text-gray-600">Watchlist Items</p>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary-600">{profileData.buyerRating?.toFixed(1) || '0.0'}</p>
                    <p className="text-sm text-gray-600">Buyer Rating</p>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary-600">₹{profileData.balance?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-gray-600">Account Balance</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Searches</h2>
                {profileData.savedSearches && profileData.savedSearches.length > 0 ? (
                  <div className="space-y-2">
                    {profileData.savedSearches.map((search, idx) => (
                      <div key={idx} className="border rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{search.query}</p>
                          {search.category && <p className="text-sm text-gray-600">Category: {search.category}</p>}
                        </div>
                        <span className="text-xs text-gray-500">{new Date(search.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No saved searches yet</p>
                )}
              </div>
            </div>
          )}

          {/* SELLING INFORMATION TAB */}
          {activeTab === 'selling' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Seller Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary-600">{profileData.sellerRating?.toFixed(1) || '0.0'}/5</p>
                    <p className="text-sm text-gray-600">Seller Rating</p>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary-600">{profileData.totalItemsSold || 0}</p>
                    <p className="text-sm text-gray-600">Items Sold</p>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary-600">{profileData.successRate || 0}%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">{profileData.sellerLevel?.toUpperCase() || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Seller Level</p>
                  </div>
                </div>

                {/* Seller Verification */}
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Seller Verification</p>
                      <p className="text-sm text-gray-600">Required to sell items</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profileData.sellerVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {profileData.sellerVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Preferences */}
              {editing && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Preferences</h2>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="shippingPreferences.domesticShipping"
                        checked={profileData.shippingPreferences?.domesticShipping || false}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="ml-3 text-gray-900">Offer Domestic Shipping</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="shippingPreferences.internationalShipping"
                        checked={profileData.shippingPreferences?.internationalShipping || false}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="ml-3 text-gray-900">Offer International Shipping</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FINANCIAL TAB */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 uppercase font-semibold mb-2">Total Earnings</p>
                    <p className="text-3xl font-bold text-green-600">₹{profileData.totalEarnings?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 uppercase font-semibold mb-2">Pending Payouts</p>
                    <p className="text-3xl font-bold text-blue-600">₹{profileData.pendingPayouts?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
                {profileData.paymentMethods && profileData.paymentMethods.length > 0 ? (
                  <div className="space-y-2">
                    {profileData.paymentMethods.map((method, idx) => (
                      <div key={idx} className="border rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{method.type}</p>
                          {method.isPrimary && <p className="text-xs text-green-600 font-semibold">PRIMARY</p>}
                        </div>
                        <span className="text-sm text-gray-600">{new Date(method.addedAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No payment methods added</p>
                )}
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payout Methods</h2>
                {profileData.payoutMethods && profileData.payoutMethods.length > 0 ? (
                  <div className="space-y-2">
                    {profileData.payoutMethods.map((method, idx) => (
                      <div key={idx} className="border rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{method.type}</p>
                          {method.isPrimary && <p className="text-xs text-green-600 font-semibold">PRIMARY</p>}
                        </div>
                        <span className="text-sm text-gray-600">{new Date(method.addedAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No payout methods added</p>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Notification Preferences */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notificationPreferences.emailNotifications"
                      checked={profileData.notificationPreferences?.emailNotifications || false}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-4 h-4 text-primary-600 rounded disabled:cursor-not-allowed"
                    />
                    <span className={`ml-3 ${!editing && 'text-gray-500'}`}>Email Notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notificationPreferences.smsNotifications"
                      checked={profileData.notificationPreferences?.smsNotifications || false}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-4 h-4 text-primary-600 rounded disabled:cursor-not-allowed"
                    />
                    <span className={`ml-3 ${!editing && 'text-gray-500'}`}>SMS Notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notificationPreferences.pushNotifications"
                      checked={profileData.notificationPreferences?.pushNotifications || false}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-4 h-4 text-primary-600 rounded disabled:cursor-not-allowed"
                    />
                    <span className={`ml-3 ${!editing && 'text-gray-500'}`}>Push Notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notificationPreferences.auctionUpdates"
                      checked={profileData.notificationPreferences?.auctionUpdates || false}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-4 h-4 text-primary-600 rounded disabled:cursor-not-allowed"
                    />
                    <span className={`ml-3 ${!editing && 'text-gray-500'}`}>Auction Updates</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notificationPreferences.promotions"
                      checked={profileData.notificationPreferences?.promotions || false}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-4 h-4 text-primary-600 rounded disabled:cursor-not-allowed"
                    />
                    <span className={`ml-3 ${!editing && 'text-gray-500'}`}>Promotional Offers</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notificationPreferences.weeklyDigest"
                      checked={profileData.notificationPreferences?.weeklyDigest || false}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-4 h-4 text-primary-600 rounded disabled:cursor-not-allowed"
                    />
                    <span className={`ml-3 ${!editing && 'text-gray-500'}`}>Weekly Digest</span>
                  </label>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                    <select
                      name="privacySettings.profileVisibility"
                      value={profileData.privacySettings?.profileVisibility || 'public'}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`input-field ${!editing && 'bg-gray-100 cursor-not-allowed'}`}
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="buyers-only">Buyers Only</option>
                    </select>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="privacySettings.showEmail"
                      checked={profileData.privacySettings?.showEmail || false}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-4 h-4 text-primary-600 rounded disabled:cursor-not-allowed"
                    />
                    <span className={`ml-3 ${!editing && 'text-gray-500'}`}>Show Email Address</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="privacySettings.showPhone"
                      checked={profileData.privacySettings?.showPhone || false}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-4 h-4 text-primary-600 rounded disabled:cursor-not-allowed"
                    />
                    <span className={`ml-3 ${!editing && 'text-gray-500'}`}>Show Phone Number</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="privacySettings.showAddress"
                      checked={profileData.privacySettings?.showAddress || false}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-4 h-4 text-primary-600 rounded disabled:cursor-not-allowed"
                    />
                    <span className={`ml-3 ${!editing && 'text-gray-500'}`}>Show Address</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="privacySettings.allowMessages"
                      checked={profileData.privacySettings?.allowMessages || false}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-4 h-4 text-primary-600 rounded disabled:cursor-not-allowed"
                    />
                    <span className={`ml-3 ${!editing && 'text-gray-500'}`}>Allow Messages from Other Users</span>
                  </label>
                </div>
              </div>

              {/* Language & Currency */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      name="language"
                      value={profileData.language || 'en'}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`input-field ${!editing && 'bg-gray-100 cursor-not-allowed'}`}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      name="currency"
                      value={profileData.currency || 'INR'}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`input-field ${!editing && 'bg-gray-100 cursor-not-allowed'}`}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>

                {/* Two-Factor Authentication */}
                <div className="border rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add extra security to your account</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profileData.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {profileData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Password Change */}
                <div className="border rounded-lg p-4 mb-4">
                  <p className="font-semibold text-gray-900 mb-3">Password Management</p>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="btn-secondary"
                  >
                    Change Password
                  </button>
                </div>

                {/* Login History */}
                <div className="border rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-3">Recent Login Activity</p>
                  {profileData.loginHistory && profileData.loginHistory.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {profileData.loginHistory.slice().reverse().map((login, idx) => (
                        <div key={idx} className="text-sm border-t pt-2 first:border-0 first:pt-0">
                          <p className="text-gray-900">{login.device || 'Unknown Device'}</p>
                          <p className="text-xs text-gray-600">IP: {login.ip || 'Unknown'}</p>
                          <p className="text-xs text-gray-600">{new Date(login.loginTime).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">No login history available</p>
                  )}
                </div>
              </div>

              {/* Blocked Users */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Blocked Users</h2>
                {profileData.blockedUsers && profileData.blockedUsers.length > 0 ? (
                  <p className="text-gray-600">You have blocked {profileData.blockedUsers.length} user(s)</p>
                ) : (
                  <p className="text-gray-600 text-center py-8">You haven't blocked any users</p>
                )}
              </div>

              {/* Suspension Status */}
              {profileData.suspensionStatus?.suspended && (
                <div className="card bg-red-50 border border-red-200">
                  <h2 className="text-lg font-semibold text-red-900 mb-3">⚠️ Account Suspension</h2>
                  <p className="text-red-800 mb-2">Reason: {profileData.suspensionStatus.reason}</p>
                  <p className="text-sm text-red-700">Until: {new Date(profileData.suspensionStatus.suspendedUntil).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}

          {/* Chat feature removed */}

          {/* Save Button */}
          {editing && (
            <div className="card bg-gray-50 flex gap-4">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  fetchProfileData();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter new password"
                  required
                  minLength="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Confirm new password"
                  required
                  minLength="6"
                />
              </div>

              <div className="border-t pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 btn-primary"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;