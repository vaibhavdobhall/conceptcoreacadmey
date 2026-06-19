'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, BookOpen, X, Filter } from 'lucide-react';
import { Booking } from '@/lib/api';
import { getAllBookings, cancelBooking } from '@/lib/api';
import { format, parseISO, isSameDay } from 'date-fns';

type FilterStatus = 'all' | 'confirmed' | 'cancelled' | 'completed';

export default function EducatorDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const allBookings = await getAllBookings();
      setBookings(allBookings);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Unable to connect to server. Please check your internet connection and try again.');
      } else if (err.message.includes('404')) {
        setError('Booking service is not configured. Please check backend configuration.');
      } else {
        setError(err.message || 'Failed to load bookings. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setCancellingId(bookingId);
      await cancelBooking(bookingId);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
      ));
    } catch (err) {
      setError('Failed to cancel booking. Please try again.');
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get unique dates from bookings
  const uniqueDates = [...new Set(bookings.map(b => b.availability_slots?.slot_date).filter(Boolean) as string[])].sort();

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesDate = !selectedDate || booking.availability_slots?.slot_date === selectedDate;
    return matchesStatus && matchesDate;
  });

  // Group bookings by date
  const bookingsByDate = filteredBookings.reduce((acc, booking) => {
    const date = booking.availability_slots?.slot_date || 'Unknown';
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <section id="dashboard" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Educator <span className="text-blue-600">Dashboard</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage and view all student bookings in one place.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">Filters:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['all', 'confirmed', 'cancelled', 'completed'] as FilterStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <div className="md:ml-auto">
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Dates</option>
                {uniqueDates.map(date => (
                  <option key={date} value={date}>
                    {format(parseISO(date), 'MMMM d, yyyy')}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : Object.keys(bookingsByDate).length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No bookings found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(bookingsByDate)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, dateBookings], dateIndex) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: dateIndex * 0.1 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {dateBookings.length} {dateBookings.length === 1 ? 'booking' : 'bookings'}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dateBookings
                      .sort((a, b) => (a.availability_slots?.start_time || '').localeCompare(b.availability_slots?.start_time || ''))
                      .map((booking, index) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`bg-white rounded-xl shadow-lg p-6 border-2 ${getStatusColor(booking.status)}`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-5 h-5" />
                              <span className="font-semibold">
                                {formatTime(booking.availability_slots?.start_time || '')} - {formatTime(booking.availability_slots?.end_time || '')}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <User className="w-4 h-4 text-gray-500 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-600">Student</p>
                                <p className="font-medium text-gray-900">{booking.student_name}</p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium text-gray-900 text-sm">{booking.student_email}</p>
                              </div>
                            </div>

                            {booking.student_phone && (
                              <div className="flex items-start space-x-3">
                                <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                                <div>
                                  <p className="text-sm text-gray-600">Phone</p>
                                  <p className="font-medium text-gray-900 text-sm">{booking.student_phone}</p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-start space-x-3">
                              <BookOpen className="w-4 h-4 text-gray-500 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-600">Subject</p>
                                <p className="font-medium text-gray-900">{booking.subject}</p>
                              </div>
                            </div>

                            {booking.notes && (
                              <div className="pt-2 border-t border-gray-200">
                                <p className="text-sm text-gray-600 mb-1">Notes</p>
                                <p className="text-sm text-gray-800">{booking.notes}</p>
                              </div>
                            )}

                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={cancellingId === booking.id}
                                className="mt-4 w-full py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                              >
                                {cancellingId === booking.id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Cancelling...</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4" />
                                    <span>Cancel Booking</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}