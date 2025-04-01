
export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  role: 'admin' | 'user';
}

export interface ParkingArea {
  id: string;
  name: string;
  location: string;
  totalSlots: number;
  pricePerHour: number;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
}

export interface ParkingSlot {
  id: string;
  number: number;
  areaId: string;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  areaId: string;
  areaName: string;
  slotId: string;
  slotNumber: number;
  timeSlotId: string;
  startTime: string;
  endTime: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  totalAmount: number;
  vehicleNumber?: string;
}
