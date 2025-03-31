
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ParkingArea, ParkingSlot, TimeSlot, Booking } from '@/types';
import { toast } from "sonner";

interface ParkingContextType {
  parkingAreas: ParkingArea[];
  parkingSlots: ParkingSlot[];
  timeSlots: TimeSlot[];
  bookings: Booking[];
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<void>;
  updateBookingStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  getAreaSlots: (areaId: string) => ParkingSlot[];
  getAvailableSlots: (areaId: string, timeSlotId: string, date: string) => ParkingSlot[];
  getUserBookings: (userId: string) => Booking[];
  getAllBookings: () => Booking[];
}

// Mock data
const MOCK_PARKING_AREAS: ParkingArea[] = [
  { id: 'area-1', name: 'Downtown Parking', location: '123 Main St', totalSlots: 50, pricePerHour: 5 },
  { id: 'area-2', name: 'Airport Parking', location: '456 Airport Rd', totalSlots: 100, pricePerHour: 8 },
  { id: 'area-3', name: 'Shopping Mall', location: '789 Market Ave', totalSlots: 75, pricePerHour: 3 },
];

const generateParkingSlots = () => {
  let slots: ParkingSlot[] = [];
  MOCK_PARKING_AREAS.forEach(area => {
    for (let i = 1; i <= area.totalSlots; i++) {
      slots.push({
        id: `slot-${area.id}-${i}`,
        number: i,
        areaId: area.id,
        isAvailable: true
      });
    }
  });
  return slots;
};

const MOCK_PARKING_SLOTS: ParkingSlot[] = generateParkingSlots();

const MOCK_TIME_SLOTS: TimeSlot[] = [
  { id: 'time-1', startTime: '08:00', endTime: '10:00', date: '' },
  { id: 'time-2', startTime: '10:00', endTime: '12:00', date: '' },
  { id: 'time-3', startTime: '12:00', endTime: '14:00', date: '' },
  { id: 'time-4', startTime: '14:00', endTime: '16:00', date: '' },
  { id: 'time-5', startTime: '16:00', endTime: '18:00', date: '' },
  { id: 'time-6', startTime: '18:00', endTime: '20:00', date: '' },
];

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    userId: '2',
    userName: 'Regular User',
    areaId: 'area-1',
    areaName: 'Downtown Parking',
    slotId: 'slot-area-1-1',
    slotNumber: 1,
    timeSlotId: 'time-1',
    startTime: '08:00',
    endTime: '10:00',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    createdAt: new Date().toISOString(),
    totalAmount: 10,
    vehicleNumber: 'ABC-123'
  }
];

const ParkingContext = createContext<ParkingContextType | null>(null);

export const ParkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [parkingAreas, setParkingAreas] = useState<ParkingArea[]>(MOCK_PARKING_AREAS);
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>(MOCK_PARKING_SLOTS);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(MOCK_TIME_SLOTS);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  // Load data from localStorage if available
  useEffect(() => {
    const storedBookings = localStorage.getItem('parkifyBookings');
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    }
  }, []);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('parkifyBookings', JSON.stringify(bookings));
  }, [bookings]);

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newBooking: Booking = {
      ...bookingData,
      id: `booking-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    setBookings(prev => [...prev, newBooking]);
    toast.success('Booking request submitted successfully!');
  };

  const updateBookingStatus = async (id: string, status: 'approved' | 'rejected') => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setBookings(prev => 
      prev.map(booking => 
        booking.id === id ? { ...booking, status } : booking
      )
    );
    
    toast.success(`Booking ${status} successfully!`);
  };

  const getAreaSlots = (areaId: string) => {
    return parkingSlots.filter(slot => slot.areaId === areaId);
  };

  const getAvailableSlots = (areaId: string, timeSlotId: string, date: string) => {
    const areaSlots = getAreaSlots(areaId);
    const bookedSlotIds = bookings
      .filter(b => 
        b.areaId === areaId && 
        b.timeSlotId === timeSlotId && 
        b.date === date &&
        (b.status === 'approved' || b.status === 'pending')
      )
      .map(b => b.slotId);
    
    return areaSlots.filter(slot => !bookedSlotIds.includes(slot.id));
  };

  const getUserBookings = (userId: string) => {
    return bookings.filter(booking => booking.userId === userId);
  };

  const getAllBookings = () => {
    return bookings;
  };

  return (
    <ParkingContext.Provider value={{
      parkingAreas,
      parkingSlots,
      timeSlots,
      bookings,
      createBooking,
      updateBookingStatus,
      getAreaSlots,
      getAvailableSlots,
      getUserBookings,
      getAllBookings
    }}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};
