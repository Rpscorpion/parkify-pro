
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Booking } from '@/types';
import { FileDown } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface BookingListPDFProps {
  bookings: Booking[];
}

const BookingListPDF = ({ bookings }: BookingListPDFProps) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

  // Filter bookings based on time range
  const getFilteredBookings = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate: Date;
    
    switch(timeRange) {
      case 'week':
        // Get the first day of the week (Sunday)
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        break;
      case 'month':
        // Get the first day of the month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      default: // day
        startDate = today;
        break;
    }
    
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= startDate && bookingDate <= now;
    });
  };

  const generatePDF = () => {
    const filteredBookings = getFilteredBookings();
    
    if (filteredBookings.length === 0) {
      return;
    }
    
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="text-align: center; color: #4f46e5;">ParkifyPro - Booking List</h1>
        <div style="text-align: center; margin-bottom: 20px;">
          <p>${timeRange === 'day' ? 'Daily' : timeRange === 'week' ? 'Weekly' : 'Monthly'} Booking Report</p>
          <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">User</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Email</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Area</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Slot</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Date</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Time</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Price</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredBookings.map(booking => `
              <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${booking.userName}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">User Email</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${booking.areaName}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">#${booking.slotNumber}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${booking.date}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${booking.startTime} - ${booking.endTime}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">$${booking.totalAmount.toFixed(2)}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${booking.status.toUpperCase()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
          <p>Total Bookings: ${filteredBookings.length}</p>
          <p>Total Revenue: $${filteredBookings.reduce((sum, booking) => sum + booking.totalAmount, 0).toFixed(2)}</p>
        </div>
      </div>
    `;
    
    const opt = {
      margin: 10,
      filename: `bookings-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={timeRange} onValueChange={(value: 'day' | 'week' | 'month') => setTimeRange(value)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Time Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
        </SelectContent>
      </Select>
      
      <Button variant="outline" onClick={generatePDF}>
        <FileDown className="mr-2 h-4 w-4" />
        Download PDF
      </Button>
    </div>
  );
};

export default BookingListPDF;
