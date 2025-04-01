
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
  updateBooking: (id: string, bookingData: Partial<Booking>) => Promise<void>;
  getAreaSlots: (areaId: string) => ParkingSlot[];
  getAvailableSlots: (areaId: string, timeSlotId: string, date: string) => ParkingSlot[];
  getUserBookings: (userId: string) => Booking[];
  getAllBookings: () => Booking[];
  addParkingArea: (area: Omit<ParkingArea, 'id'>) => Promise<void>;
  addTimeSlot: (timeSlot: Omit<TimeSlot, 'id'>) => Promise<void>;
  getBookingsByStatus: (status: 'pending' | 'approved' | 'rejected') => Booking[];
  getBookingStatistics: () => {
    totalBookings: number;
    pending: number;
    approved: number;
    rejected: number;
    bookingsByDay: { date: string; count: number }[];
    bookingsByMonth: { month: string; count: number }[];
  };
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
    
    const storedAreas = localStorage.getItem('parkifyAreas');
    if (storedAreas) {
      setParkingAreas(JSON.parse(storedAreas));
    }
    
    const storedTimeSlots = localStorage.getItem('parkifyTimeSlots');
    if (storedTimeSlots) {
      setTimeSlots(JSON.parse(storedTimeSlots));
    }
  }, []);

  // Save data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('parkifyBookings', JSON.stringify(bookings));
  }, [bookings]);
  
  useEffect(() => {
    localStorage.setItem('parkifyAreas', JSON.stringify(parkingAreas));
    
    // Regenerate parking slots when areas change
    const newSlots = [];
    parkingAreas.forEach(area => {
      for (let i = 1; i <= area.totalSlots; i++) {
        newSlots.push({
          id: `slot-${area.id}-${i}`,
          number: i,
          areaId: area.id,
          isAvailable: true
        });
      }
    });
    setParkingSlots(newSlots);
  }, [parkingAreas]);
  
  useEffect(() => {
    localStorage.setItem('parkifyTimeSlots', JSON.stringify(timeSlots));
  }, [timeSlots]);

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
  
  const updateBooking = async (id: string, bookingData: Partial<Booking>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setBookings(prev => 
      prev.map(booking => 
        booking.id === id ? { ...booking, ...bookingData } : booking
      )
    );
    
    toast.success('Booking updated successfully!');
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
  
  const addParkingArea = async (area: Omit<ParkingArea, 'id'>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newArea: ParkingArea = {
      ...area,
      id: `area-${Date.now()}`
    };
    
    setParkingAreas(prev => [...prev, newArea]);
    toast.success('Parking area added successfully!');
  };
  
  const addTimeSlot = async (timeSlot: Omit<TimeSlot, 'id'>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newTimeSlot: TimeSlot = {
      ...timeSlot,
      id: `time-${Date.now()}`
    };
    
    setTimeSlots(prev => [...prev, newTimeSlot]);
    toast.success('Time slot added successfully!');
  };
  
  const getBookingsByStatus = (status: 'pending' | 'approved' | 'rejected') => {
    return bookings.filter(booking => booking.status === status);
  };
  
  const getBookingStatistics = () => {
    const pending = bookings.filter(b => b.status === 'pending').length;
    const approved = bookings.filter(b => b.status === 'approved').length;
    const rejected = bookings.filter(b => b.status === 'rejected').length;
    
    // Get bookings by day for the last 7 days
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    const bookingsByDay = last7Days.map(date => {
      const count = bookings.filter(b => b.date === date).length;
      return { date, count };
    });
    
    // Get bookings by month for the last 12 months
    const last12Months = [...Array(12)].map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      return month;
    }).reverse();
    
    const bookingsByMonth = last12Months.map(month => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = monthNames.findIndex(m => month.includes(m));
      const currentYear = '20' + month.split(' ')[1]; // Convert '23 to 2023
      
      const count = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === parseInt(currentYear);
      }).length;
      
      return { month, count };
    });
    
    return {
      totalBookings: bookings.length,
      pending,
      approved,
      rejected,
      bookingsByDay,
      bookingsByMonth
    };
  };

  return (
    <ParkingContext.Provider value={{
      parkingAreas,
      parkingSlots,
      timeSlots,
      bookings,
      createBooking,
      updateBookingStatus,
      updateBooking,
      getAreaSlots,
      getAvailableSlots,
      getUserBookings,
      getAllBookings,
      addParkingArea,
      addTimeSlot,
      getBookingsByStatus,
      getBookingStatistics
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
