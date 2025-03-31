
import React from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useParking } from '@/context/ParkingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Car, CalendarCheck } from 'lucide-react';

const Bookings = () => {
  const { user } = useAuth();
  const { getUserBookings } = useParking();

  if (!user) return null;

  const bookings = getUserBookings(user.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success';
      case 'pending':
        return 'bg-pending';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-lg">
            <CalendarCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No bookings yet</h3>
            <p className="text-gray-500 mt-2">Your booking history will appear here once you make a reservation.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{booking.areaName}</CardTitle>
                      <CardDescription>Booking ID: {booking.id}</CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(booking.status)} text-white`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <span>Slot #{booking.slotNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <span>{booking.date} | {booking.startTime} - {booking.endTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Car className="h-5 w-5 text-gray-500" />
                        <span>{booking.vehicleNumber || 'No vehicle number'}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-sm">
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Status</span>
                          <span className="font-medium">{booking.status}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Date</span>
                          <span className="font-medium">{booking.date}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Time</span>
                          <span className="font-medium">{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div className="flex justify-between py-1 border-t mt-1 pt-1">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="font-medium">${booking.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Bookings;
