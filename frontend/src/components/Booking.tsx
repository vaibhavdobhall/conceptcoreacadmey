'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, BookOpen, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { TimeSlot, CreateBookingData } from '@/lib/api';
import { getAvailableSlots, createBooking } from '@/lib/api';
import { format, addDays, isSameDay, parseISO } from 'date-fns';

type BookingStep = 'select-slot' | 'fill-details' | 'confirmation';

export default function Booking() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('select-slot');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [formData, setFormData] = useState<CreateBookingData>({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    subject: '',
    notes: '',
    slotId: ''
  });

  // Fetch available slots
  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const availableSlots = await getAvailableSlots();
      setSlots(availableSlots);
    } catch (err) {
      setError('Failed to load available time slots. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique dates with available slots
  const availableDates = [...new Set(slots.map(slot => slot.slot_date))].sort();

  // Filter slots for selected date
  const slotsForSelectedDate = slots.filter(slot => 
    isSameDay(parseISO(slot.slot_date), selectedDate)
  );

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setFormData(prev => ({ ...prev, slotId: slot.id }));
    setCurrentStep('fill-details');
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.slotId) {
      setError('Please select a time slot');
      return;
    }

    try {
      setSubmitting(true);
      const booking = await createBooking(formData);
      setConfirmationData(booking);
      setCurrentStep('confirmation');
    } catch (err: any) {
      setError(err.message || 'Failed to create booking. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToSlots = () => {
    setCurrentStep('select-slot');
    setSelectedSlot(null);
    setFormData(prev => ({ ...prev, slotId: '' }));
  };

  const handleNewBooking = () => {
    setCurrentStep('select-slot');
    setSelectedSlot(null);
    setConfirmationData(null);
    setFormData({
      studentName: '',
      studentEmail: '',
      studentPhone: '',
      subject: '',
      notes: '',
      slotId: ''
    });
    fetchSlots(); // Refresh slots in case others were booked
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <section id="booking" className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Book Your <span className="text-blue-600">Session</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select a convenient time slot and start your learning journey today.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              {['select-slot', 'fill-details', 'confirmation'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep === step
                      ? 'bg-blue-600 text-white'
                      : ['select-slot', 'fill-details', 'confirmation'].indexOf(currentStep) > index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {['select-slot', 'fill-details', 'confirmation'].indexOf(currentStep) > index ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 2 && (
                    <div className={`w-16 h-1 mx-2 ${
                      ['select-slot', 'fill-details', 'confirmation'].indexOf(currentStep) > index
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Select Time Slot */}
            {currentStep === 'select-slot' && (
              <motion.div
                key="select-slot"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Select a Date & Time</h3>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-12 text-red-600">
                    <AlertCircle className="w-6 h-6 mr-2" />
                    <p>{error}</p>
                  </div>
                ) : availableDates.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">No available time slots at the moment.</p>
                    <p className="text-sm mt-2">Please check back later.</p>
                  </div>
                ) : (
                  <>
                    {/* Date Selector */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Choose a Date
                      </label>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {availableDates.map((dateStr) => {
                          const date = parseISO(dateStr);
                          const isSelected = isSameDay(date, selectedDate);
                          const slotsOnDate = slots.filter(s => isSameDay(parseISO(s.slot_date), date));
                          
                          return (
                            <motion.button
                              key={dateStr}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedDate(date)}
                              className={`flex-shrink-0 px-6 py-4 rounded-xl border-2 transition-all ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-sm text-gray-600">
                                  {format(date, 'EEE')}
                                </div>
                                <div className={`text-2xl font-bold ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                                  {format(date, 'd')}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {format(date, 'MMM')}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {slotsOnDate.length} slots
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Available Time Slots
                      </label>
                      {slotsForSelectedDate.length === 0 ? (
                        <p className="text-center py-8 text-gray-600">No slots available for this date.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {slotsForSelectedDate.map((slot) => (
                            <motion.button
                              key={slot.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSlotSelect(slot)}
                              className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-all"
                            >
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-blue-900">
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Step 2: Fill Details */}
            {currentStep === 'fill-details' && selectedSlot && (
              <motion.div
                key="fill-details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Your Information</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleBackToSlots}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Change Time
                  </motion.button>
                </div>

                {/* Selected Slot Info */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {format(parseISO(selectedSlot.slot_date), 'MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="studentName"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="studentEmail"
                        name="studentEmail"
                        value={formData.studentEmail}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="studentPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="studentPhone"
                        name="studentPhone"
                        value={formData.studentPhone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject/Topic *
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Mathematics, Physics, Chemistry"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any specific topics you'd like to cover or questions you have..."
                    />
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
                      <AlertCircle className="w-5 h-5" />
                      <p>{error}</p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Confirming Booking...</span>
                      </>
                    ) : (
                      <span>Confirm Booking</span>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 'confirmation' && confirmationData && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </motion.div>

                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Booking Confirmed!
                </h3>
                <p className="text-lg text-gray-600 mb-8">
                  Your session has been successfully booked. We've sent a confirmation email with all the details.
                </p>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-8 text-left">
                  <h4 className="font-semibold text-gray-900 mb-4">Booking Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Student</p>
                        <p className="font-medium text-gray-900">{confirmationData.student_name}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{confirmationData.student_email}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Date & Time</p>
                        <p className="font-medium text-gray-900">
                          {format(parseISO(confirmationData.availability_slots?.slot_date || ''), 'MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatTime(confirmationData.availability_slots?.start_time || '')} - {formatTime(confirmationData.availability_slots?.end_time || '')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Subject</p>
                        <p className="font-medium text-gray-900">{confirmationData.subject}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewBooking}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Book Another Session
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}