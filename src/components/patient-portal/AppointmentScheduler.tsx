import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon,
  VideoCameraIcon,
  PhoneIcon,
  UserIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface Provider {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  specialty?: string;
}

interface AppointmentSlot {
  start: string;
  end: string;
  duration_minutes: number;
  available: boolean;
}

interface AppointmentRequest {
  provider_id: number;
  appointment_type: string;
  scheduled_start: string;
  scheduled_end: string;
  duration_minutes: number;
  location_type: string;
  location_details?: string;
  reason_for_visit?: string;
  notes?: string;
}

const AppointmentScheduler: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [appointmentType, setAppointmentType] = useState('consultation');
  const [locationType, setLocationType] = useState('virtual');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [notes, setNotes] = useState('');
  
  // Date range for slot search
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProviders();
    setDefaultDateRange();
  }, []);

  const setDefaultDateRange = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(nextWeek.toISOString().split('T')[0]);
  };

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/provider/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }

      const data = await response.json();
      setProviders(data.providers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
    }
  };

  const fetchAvailableSlots = async (providerId: number) => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `/api/v1/patient-portal/appointments/available-slots?provider_id=${providerId}&start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }

      const slots = await response.json();
      setAvailableSlots(slots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch available slots');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setSelectedSlot(null);
    fetchAvailableSlots(provider.id);
  };

  const handleSlotSelect = (slot: AppointmentSlot) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProvider || !selectedSlot) {
      setError('Please select a provider and time slot');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const appointmentRequest: AppointmentRequest = {
        provider_id: selectedProvider.id,
        appointment_type: appointmentType,
        scheduled_start: selectedSlot.start,
        scheduled_end: selectedSlot.end,
        duration_minutes: selectedSlot.duration_minutes,
        location_type: locationType,
        location_details: locationType === 'in-person' ? 'Office location TBD' : undefined,
        reason_for_visit: reasonForVisit,
        notes: notes
      };

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/patient-portal/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to schedule appointment');
      }

      const result = await response.json();
      setSuccess('Appointment request submitted successfully!');
      
      // Reset form
      setTimeout(() => {
        navigate('/patient-portal/dashboard');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const groupSlotsByDate = (slots: AppointmentSlot[]) => {
    const grouped: { [key: string]: AppointmentSlot[] } = {};
    
    slots.forEach(slot => {
      const date = slot.start.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });
    
    return grouped;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schedule Appointment</h1>
              <p className="mt-1 text-sm text-gray-500">
                Book an appointment with a mental health provider.
              </p>
            </div>
            <button
              onClick={() => navigate('/patient-portal/dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <XMarkIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckIcon className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Select Provider */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">1. Select Provider</h2>
            
            {selectedProvider ? (
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Dr. {selectedProvider.first_name} {selectedProvider.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{selectedProvider.email}</p>
                      {selectedProvider.specialty && (
                        <p className="text-sm text-blue-600">{selectedProvider.specialty}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProvider(null);
                      setAvailableSlots([]);
                      setSelectedSlot(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleProviderSelect(provider)}
                    className="text-left border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <UserIcon className="h-8 w-8 text-gray-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          Dr. {provider.first_name} {provider.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{provider.email}</p>
                        {provider.specialty && (
                          <p className="text-sm text-blue-600">{provider.specialty}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Appointment Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">2. Appointment Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Type
                </label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="consultation">Initial Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="therapy">Therapy Session</option>
                  <option value="medication_management">Medication Management</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Type
                </label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="virtual">Virtual (Video Call)</option>
                  <option value="in-person">In-Person</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit
              </label>
              <textarea
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                rows={3}
                placeholder="Briefly describe the reason for your appointment..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any additional information you'd like to share..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Step 3: Select Time Slot */}
          {selectedProvider && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">3. Select Time Slot</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Date Range
                </label>
                <div className="flex gap-4">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => selectedProvider && fetchAvailableSlots(selectedProvider.id)}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Searching for available slots...</p>
                </div>
              )}

              {!loading && availableSlots.length > 0 && (
                <div className="space-y-4">
                  {Object.entries(groupSlotsByDate(availableSlots)).map(([date, slots]) => (
                    <div key={date}>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        {formatDate(date)}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {slots.map((slot, index) => (
                          <button
                            key={`${date}-${index}`}
                            type="button"
                            onClick={() => handleSlotSelect(slot)}
                            className={`p-2 text-sm border rounded-md transition-colors ${
                              selectedSlot?.start === slot.start
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                            }`}
                          >
                            {formatTime(slot.start)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && availableSlots.length === 0 && selectedProvider && (
                <div className="text-center py-8">
                  <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No available slots</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No available time slots found for the selected date range.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          {selectedProvider && selectedSlot && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Appointment Summary</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Provider:</strong> Dr. {selectedProvider.first_name} {selectedProvider.last_name}</p>
                    <p><strong>Date & Time:</strong> {formatDate(selectedSlot.start)} at {formatTime(selectedSlot.start)}</p>
                    <p><strong>Type:</strong> {appointmentType}</p>
                    <p><strong>Location:</strong> {locationType}</p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      Request Appointment
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
