
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useParking } from '@/context/ParkingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Check, X, FileText, Printer, MapPin, Clock, Car, Edit } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const AdminBookings = () => {
  const { getAllBookings, updateBookingStatus, updateBooking } = useParking();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modifiedSlotNumber, setModifiedSlotNumber] = useState('');
  const [modifiedStatus, setModifiedStatus] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const bookings = getAllBookings();
  
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.areaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.vehicleNumber && booking.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateBookingStatus(id, status);
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };
  
  const handleModify = (booking: any) => {
    setSelectedBooking(booking);
    setModifiedSlotNumber(booking.slotNumber.toString());
    setModifiedStatus(booking.status);
    setIsDialogOpen(true);
  };
  
  const handleSaveModifications = async () => {
    if (selectedBooking) {
      try {
        await updateBooking(selectedBooking.id, {
          ...selectedBooking,
          slotNumber: parseInt(modifiedSlotNumber),
          status: modifiedStatus as 'pending' | 'approved' | 'rejected'
        });
        setIsDialogOpen(false);
      } catch (error) {
        console.error('Modification failed:', error);
      }
    }
  };
  
  const printBookings = () => {
    const element = document.getElementById('bookings-for-print');
    if (!element) return;

    const opt = {
      margin: 1,
      filename: 'parking-bookings.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().from(element).set(opt).save();
  };

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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Bookings</h1>
          <Button onClick={printBookings} variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Bookings
          </Button>
        </div>
        
        <div className="mb-6 grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input 
              placeholder="Search bookings..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          
          <div className="md:col-span-2">
            <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
                <TabsTrigger value="approved" className="flex-1">Approved</TabsTrigger>
                <TabsTrigger value="rejected" className="flex-1">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center p-10 bg-gray-50 rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No bookings found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{booking.areaName} - Slot #{booking.slotNumber}</CardTitle>
                      <CardDescription>Booking ID: {booking.id}</CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(booking.status)} text-white`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">User Details</p>
                      <p className="text-sm">{booking.userName}</p>
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{booking.vehicleNumber || 'No vehicle number'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Booking Details</p>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{booking.areaName} - Slot #{booking.slotNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{booking.date} | {booking.startTime} - {booking.endTime}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-sm font-medium mr-2">Total: ${booking.totalAmount.toFixed(2)}</span>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-blue-500 text-white hover:bg-blue-600"
                        onClick={() => handleModify(booking)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Modify
                      </Button>
                      
                      {booking.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-success text-white hover:bg-green-600"
                            onClick={() => handleStatusUpdate(booking.id, 'approved')}
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-danger text-white hover:bg-red-600"
                            onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                          >
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Modify Booking</DialogTitle>
              <DialogDescription>
                Make changes to the booking details.
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="slotNumber">Slot Number</Label>
                  <Input
                    id="slotNumber"
                    type="number"
                    value={modifiedSlotNumber}
                    onChange={(e) => setModifiedSlotNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={modifiedStatus} onValueChange={setModifiedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveModifications}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Hidden section for PDF generation */}
        <div id="bookings-for-print" className="hidden">
          <h1 className="text-2xl font-bold mb-4">Parking Bookings Report</h1>
          <p className="mb-4">Generated on: {new Date().toLocaleDateString()}</p>
          
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-left">ID</th>
                <th className="border p-2 text-left">User</th>
                <th className="border p-2 text-left">Area</th>
                <th className="border p-2 text-left">Slot</th>
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Time</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="border p-2">{booking.id}</td>
                  <td className="border p-2">{booking.userName}</td>
                  <td className="border p-2">{booking.areaName}</td>
                  <td className="border p-2">#{booking.slotNumber}</td>
                  <td className="border p-2">{booking.date}</td>
                  <td className="border p-2">{booking.startTime} - {booking.endTime}</td>
                  <td className="border p-2">{booking.status}</td>
                  <td className="border p-2">${booking.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminBookings;
