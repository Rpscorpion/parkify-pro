
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useParking } from '@/context/ParkingContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ParkingArea, TimeSlot } from '@/types';
import { CircleCheck, CircleX, Clock, Users, Car, CalendarRange } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const AdminDashboard = () => {
  const { parkingAreas, timeSlots, addParkingArea, addTimeSlot, getBookingsByStatus, getBookingStatistics } = useParking();
  const stats = getBookingStatistics();
  const [isAddAreaOpen, setIsAddAreaOpen] = useState(false);
  const [isAddTimeSlotOpen, setIsAddTimeSlotOpen] = useState(false);
  const [newArea, setNewArea] = useState<Omit<ParkingArea, 'id'>>({
    name: '',
    location: '',
    totalSlots: 0,
    pricePerHour: 0
  });
  const [newTimeSlot, setNewTimeSlot] = useState<Omit<TimeSlot, 'id'>>({
    startTime: '',
    endTime: '',
    date: ''
  });
  const [activeTab, setActiveTab] = useState('daily');
  
  const pendingBookings = getBookingsByStatus('pending');
  const approvedBookings = getBookingsByStatus('approved');
  const rejectedBookings = getBookingsByStatus('rejected');
  
  const statusData = [
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Approved', value: stats.approved, color: '#10b981' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
  ];
  
  const handleAddArea = async () => {
    await addParkingArea(newArea);
    setNewArea({
      name: '',
      location: '',
      totalSlots: 0,
      pricePerHour: 0
    });
    setIsAddAreaOpen(false);
  };
  
  const handleAddTimeSlot = async () => {
    await addTimeSlot(newTimeSlot);
    setNewTimeSlot({
      startTime: '',
      endTime: '',
      date: ''
    });
    setIsAddTimeSlotOpen(false);
  };
  
  const generateUsersPDF = () => {
    // Mock user data for example purposes
    const mockUsers = [
      { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      { id: '2', name: 'Regular User', email: 'user@example.com', role: 'user' },
    ];
    
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="text-align: center; color: #4f46e5;">ParkifyPro - Users List</h1>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-top: 20px;">
          <h2 style="border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Users</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">ID</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Name</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Email</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Role</th>
              </tr>
            </thead>
            <tbody>
              ${mockUsers.map(user => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${user.id}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${user.name}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${user.email}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${user.role}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    const opt = {
      margin: 10,
      filename: 'users-list.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().from(element).set(opt).save();
  };
  
  const chartConfig = {
    pending: { label: 'Pending', color: '#f59e0b' },
    approved: { label: 'Approved', color: '#10b981' },
    rejected: { label: 'Rejected', color: '#ef4444' },
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddAreaOpen(true)}>Add New Area</Button>
            <Button variant="outline" onClick={() => setIsAddTimeSlotOpen(true)}>Add Time Slot</Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <Car className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-500">{stats.approved}</div>
                <CircleCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
                <CircleX className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Status Distribution</CardTitle>
              <CardDescription>Overview of all booking statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Booking Trends</CardTitle>
              <CardDescription>
                <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    {activeTab === 'daily' ? (
                      <BarChart data={stats.bookingsByDay}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="#8884d8" name="Bookings" />
                      </BarChart>
                    ) : (
                      <BarChart data={stats.bookingsByMonth}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="#8884d8" name="Bookings" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Booking Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pending Bookings</CardTitle>
              <CardDescription>{pendingBookings.length} bookings awaiting approval</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-auto">
              {pendingBookings.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No pending bookings</p>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map(booking => (
                    <div key={booking.id} className="border-b pb-3 last:border-0">
                      <p className="font-medium">{booking.userName}</p>
                      <p className="text-sm text-muted-foreground">{booking.areaName} - #{booking.slotNumber}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <CalendarRange className="h-3 w-3 mr-1" />
                        {booking.date} | {booking.startTime} - {booking.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Approved Bookings</CardTitle>
              <CardDescription>{approvedBookings.length} confirmed bookings</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-auto">
              {approvedBookings.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No approved bookings</p>
              ) : (
                <div className="space-y-4">
                  {approvedBookings.map(booking => (
                    <div key={booking.id} className="border-b pb-3 last:border-0">
                      <p className="font-medium">{booking.userName}</p>
                      <p className="text-sm text-muted-foreground">{booking.areaName} - #{booking.slotNumber}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <CalendarRange className="h-3 w-3 mr-1" />
                        {booking.date} | {booking.startTime} - {booking.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Rejected Bookings</CardTitle>
              <CardDescription>{rejectedBookings.length} declined bookings</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-auto">
              {rejectedBookings.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No rejected bookings</p>
              ) : (
                <div className="space-y-4">
                  {rejectedBookings.map(booking => (
                    <div key={booking.id} className="border-b pb-3 last:border-0">
                      <p className="font-medium">{booking.userName}</p>
                      <p className="text-sm text-muted-foreground">{booking.areaName} - #{booking.slotNumber}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <CalendarRange className="h-3 w-3 mr-1" />
                        {booking.date} | {booking.startTime} - {booking.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Area Dialog */}
      <Dialog open={isAddAreaOpen} onOpenChange={setIsAddAreaOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Parking Area</DialogTitle>
            <DialogDescription>
              Enter the details for the new parking area.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newArea.name}
                onChange={(e) => setNewArea({...newArea, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={newArea.location}
                onChange={(e) => setNewArea({...newArea, location: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalSlots" className="text-right">
                Total Slots
              </Label>
              <Input
                id="totalSlots"
                type="number"
                value={newArea.totalSlots}
                onChange={(e) => setNewArea({...newArea, totalSlots: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pricePerHour" className="text-right">
                Price Per Hour
              </Label>
              <Input
                id="pricePerHour"
                type="number"
                value={newArea.pricePerHour}
                onChange={(e) => setNewArea({...newArea, pricePerHour: parseFloat(e.target.value)})}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAreaOpen(false)}>Cancel</Button>
            <Button onClick={handleAddArea}>Add Area</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Time Slot Dialog */}
      <Dialog open={isAddTimeSlotOpen} onOpenChange={setIsAddTimeSlotOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Time Slot</DialogTitle>
            <DialogDescription>
              Enter the details for the new time slot.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={newTimeSlot.startTime}
                onChange={(e) => setNewTimeSlot({...newTimeSlot, startTime: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={newTimeSlot.endTime}
                onChange={(e) => setNewTimeSlot({...newTimeSlot, endTime: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTimeSlotOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTimeSlot}>Add Time Slot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminDashboard;
