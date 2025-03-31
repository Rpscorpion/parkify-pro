
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useParking } from '@/context/ParkingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Clock, Car } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { parkingAreas, timeSlots, getAvailableSlots, createBooking } = useParking();
  const navigate = useNavigate();
  
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [isBooking, setIsBooking] = useState<boolean>(false);

  // Get available slots based on selection
  const availableSlots = selectedArea && selectedTimeSlot && selectedDate 
    ? getAvailableSlots(selectedArea, selectedTimeSlot, selectedDate)
    : [];

  // Get selected area details
  const selectedAreaDetails = parkingAreas.find(area => area.id === selectedArea);

  // Get selected time slot details
  const selectedTimeSlotDetails = timeSlots.find(slot => slot.id === selectedTimeSlot);

  const calculateTotalAmount = () => {
    if (!selectedAreaDetails || !selectedTimeSlotDetails) return 0;
    
    const startHour = parseInt(selectedTimeSlotDetails.startTime.split(':')[0]);
    const endHour = parseInt(selectedTimeSlotDetails.endTime.split(':')[0]);
    const hours = endHour - startHour;
    
    return selectedAreaDetails.pricePerHour * hours;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedAreaDetails || !selectedTimeSlotDetails) return;

    const selectedSlotObj = availableSlots.find(slot => slot.id === selectedSlot);
    if (!selectedSlotObj) return;

    setIsBooking(true);

    try {
      await createBooking({
        userId: user.id,
        userName: user.name,
        areaId: selectedArea,
        areaName: selectedAreaDetails.name,
        slotId: selectedSlot,
        slotNumber: selectedSlotObj.number,
        timeSlotId: selectedTimeSlot,
        startTime: selectedTimeSlotDetails.startTime,
        endTime: selectedTimeSlotDetails.endTime,
        date: selectedDate,
        status: 'pending',
        totalAmount: calculateTotalAmount(),
        vehicleNumber
      });
      
      navigate('/bookings');
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsBooking(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Book a Parking Slot</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Available Parking</CardTitle>
              <CardDescription>Select location, date and time</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Parking Area</Label>
                  <Select value={selectedArea} onValueChange={setSelectedArea} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a parking area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {parkingAreas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name} - {area.location}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={selectedDate} 
                    min={today}
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeSlot">Time Slot</Label>
                  <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.startTime} - {slot.endTime}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedArea && selectedTimeSlot && selectedDate && (
                  <div className="space-y-2">
                    <Label htmlFor="slot">Select Parking Slot</Label>
                    <Select value={selectedSlot} onValueChange={setSelectedSlot} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parking slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {availableSlots.length > 0 ? (
                            availableSlots.map((slot) => (
                              <SelectItem key={slot.id} value={slot.id}>
                                Slot #{slot.number}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No slots available</SelectItem>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                  <Input 
                    id="vehicleNumber" 
                    value={vehicleNumber} 
                    onChange={(e) => setVehicleNumber(e.target.value)} 
                    placeholder="e.g., ABC-123"
                    required 
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={
                    isBooking || 
                    !selectedArea || 
                    !selectedDate || 
                    !selectedTimeSlot || 
                    !selectedSlot ||
                    !vehicleNumber
                  }
                >
                  {isBooking ? 'Processing...' : 'Book Now'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {selectedAreaDetails && selectedTimeSlotDetails && selectedSlot && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>Review your booking details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium">{selectedAreaDetails.name}</p>
                    <p className="text-sm text-gray-500">{selectedAreaDetails.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium">{selectedDate}</p>
                    <p className="text-sm text-gray-500">
                      {selectedTimeSlotDetails.startTime} - {selectedTimeSlotDetails.endTime}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Car className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium">Slot #{availableSlots.find(s => s.id === selectedSlot)?.number}</p>
                    <p className="text-sm text-gray-500">{vehicleNumber || 'No vehicle number'}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span>Price per hour</span>
                    <span>${selectedAreaDetails.pricePerHour.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span>Duration</span>
                    <span>
                      {parseInt(selectedTimeSlotDetails.endTime.split(':')[0]) - 
                       parseInt(selectedTimeSlotDetails.startTime.split(':')[0])} hours
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4 font-bold">
                    <span>Total Amount</span>
                    <span>${calculateTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500 w-full text-center">
                  Your booking will be pending until approved by an admin
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
