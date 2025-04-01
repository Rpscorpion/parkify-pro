
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useParking } from '@/context/ParkingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Booking } from '@/types';
import { CheckCircle, XCircle, Pencil, CalendarIcon } from 'lucide-react';
import BookingListPDF from '@/components/BookingListPDF';
import BookingPDF from '@/components/BookingPDF';
import html2pdf from 'html2pdf.js';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

const AdminBookings = () => {
  const { bookings, parkingAreas, timeSlots, updateBookingStatus, updateBooking } = useParking();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    areaId: '',
    timeSlotId: '',
    date: '',
    status: '' as 'pending' | 'approved' | 'rejected',
    vehicleNumber: ''
  });

  const handleStatusChange = async (bookingId: string, status: 'approved' | 'rejected') => {
    await updateBookingStatus(bookingId, status);
  };

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditForm({
      areaId: booking.areaId,
      timeSlotId: booking.timeSlotId,
      date: booking.date,
      status: booking.status,
      vehicleNumber: booking.vehicleNumber || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (selectedBooking) {
      const selectedArea = parkingAreas.find(area => area.id === editForm.areaId);
      const selectedTimeSlot = timeSlots.find(slot => slot.id === editForm.timeSlotId);
      
      if (!selectedArea || !selectedTimeSlot) return;
      
      const updatedBooking: Partial<Booking> = {
        areaId: editForm.areaId,
        areaName: selectedArea.name,
        timeSlotId: editForm.timeSlotId,
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        date: editForm.date,
        status: editForm.status,
        vehicleNumber: editForm.vehicleNumber,
        totalAmount: selectedArea.pricePerHour * 
          ((parseInt(selectedTimeSlot.endTime.split(':')[0]) - parseInt(selectedTimeSlot.startTime.split(':')[0])))
      };
      
      await updateBooking(selectedBooking.id, updatedBooking);
      setIsEditModalOpen(false);
    }
  };
  
  const generatePDF = (booking: Booking) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="text-align: center; color: #4f46e5;">ParkifyPro - Booking Details</h1>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-top: 20px;">
          <h2 style="border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Booking #${booking.id}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">User</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${booking.userName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Parking Area</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${booking.areaName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Slot Number</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${booking.slotNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Date</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${booking.date}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Time</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${booking.startTime} - ${booking.endTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Vehicle Number</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${booking.vehicleNumber || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Status</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${booking.status.toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total Amount</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">$${booking.totalAmount.toFixed(2)}</td>
            </tr>
          </table>
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>Thank you for choosing ParkifyPro!</p>
            <p>For any questions, please contact support@parkifypro.com</p>
          </div>
        </div>
      </div>
    `;
    
    const opt = {
      margin: 10,
      filename: `booking-${booking.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().from(element).set(opt).save();
  };

  const filterStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Bookings</h1>
          <BookingListPDF bookings={bookings} />
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No bookings found</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Parking Area</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.userName}</TableCell>
                      <TableCell>{booking.areaName}</TableCell>
                      <TableCell>#{booking.slotNumber}</TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>{booking.startTime} - {booking.endTime}</TableCell>
                      <TableCell>${booking.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={filterStatusColor(booking.status)}>
                          {booking.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 text-green-600 hover:bg-green-100"
                                onClick={() => handleStatusChange(booking.id, 'approved')}
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="sr-only">Approve</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-red-50 text-red-600 hover:bg-red-100"
                                onClick={() => handleStatusChange(booking.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4" />
                                <span className="sr-only">Reject</span>
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(booking)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generatePDF(booking)}
                          >
                            <CalendarIcon className="h-4 w-4" />
                            <span className="sr-only">PDF</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Make changes to the booking. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="area" className="text-right">
                Parking Area
              </Label>
              <div className="col-span-3">
                <Select 
                  value={editForm.areaId} 
                  onValueChange={(value) => setEditForm({...editForm, areaId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Area" />
                  </SelectTrigger>
                  <SelectContent>
                    {parkingAreas.map(area => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeSlot" className="text-right">
                Time Slot
              </Label>
              <div className="col-span-3">
                <Select 
                  value={editForm.timeSlotId} 
                  onValueChange={(value) => setEditForm({...editForm, timeSlotId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Time Slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.startTime} - {slot.endTime}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Select 
                  value={editForm.status} 
                  onValueChange={(value: 'pending' | 'approved' | 'rejected') => setEditForm({...editForm, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vehicleNumber" className="text-right">
                Vehicle Number
              </Label>
              <Input
                id="vehicleNumber"
                value={editForm.vehicleNumber}
                onChange={(e) => setEditForm({...editForm, vehicleNumber: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminBookings;
