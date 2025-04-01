
import { Button } from '@/components/ui/button';
import { Booking } from '@/types';
import { Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface BookingPDFProps {
  booking: Booking;
}

const BookingPDF = ({ booking }: BookingPDFProps) => {
  const printBooking = () => {
    const element = document.getElementById(`booking-pdf-${booking.id}`);
    if (!element) return;

    const opt = {
      margin: 1,
      filename: `parking-booking-${booking.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().from(element).set(opt).save();
  };

  return (
    <>
      <Button 
        onClick={printBooking} 
        variant="outline"
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Print Booking
      </Button>
      
      {/* Hidden section for PDF generation */}
      <div id={`booking-pdf-${booking.id}`} className="hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">ParkifyPro</h1>
            <p className="text-gray-500">Parking Reservation Confirmation</p>
          </div>
          
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Booking ID</p>
                <p className="font-medium">{booking.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium capitalize">{booking.status}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{booking.date}</p>
              </div>
              <div>
                <p className="text-gray-500">Time</p>
                <p className="font-medium">{booking.startTime} - {booking.endTime}</p>
              </div>
            </div>
          </div>
          
          <div className="border-b border-gray-200 py-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Location Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Parking Area</p>
                <p className="font-medium">{booking.areaName}</p>
              </div>
              <div>
                <p className="text-gray-500">Slot Number</p>
                <p className="font-medium">#{booking.slotNumber}</p>
              </div>
              {booking.vehicleNumber && (
                <div>
                  <p className="text-gray-500">Vehicle Number</p>
                  <p className="font-medium">{booking.vehicleNumber}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="py-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            <div className="flex justify-between items-center border-t border-b py-2">
              <p className="font-medium">Total Amount</p>
              <p className="font-bold">${booking.totalAmount.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">Generated on {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingPDF;
