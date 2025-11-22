// Booking functionality for Safari Stays Host Dashboard
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is authenticated
    if (!window.SafariStaysAPI || !SafariStaysAPI.auth.isAuthenticated()) {
        // Show message or redirect to login
        const bookingList = document.getElementById('booking-list');
        if (bookingList) {
            bookingList.innerHTML = '<p class="text-center p-4">Please login to view bookings</p>';
        }
        return;
    }

    const user = SafariStaysAPI.getCurrentUser();
    const bookingList = document.getElementById('booking-list');
    const statsCards = document.querySelectorAll('.card p.text-2xl');

    // Load host stats if user is a host
    if (user && user.role === 'host' && window.SafariStaysAPI) {
        try {
            const stats = await SafariStaysAPI.host.getStats();
            if (statsCards.length >= 4) {
                statsCards[0].textContent = '$' + stats.totalEarnings.toLocaleString();
                statsCards[1].textContent = stats.totalBookings;
                statsCards[2].textContent = stats.occupancyRate + '%';
                statsCards[3].textContent = stats.averageRating;
            }
        } catch (error) {
            console.error('Error loading host stats:', error);
        }
    }

    // Load bookings
    if (bookingList && window.SafariStaysAPI) {
        try {
            const bookings = await SafariStaysAPI.bookings.getAll();
            if (bookings.length > 0) {
                displayBookings(bookings);
            } else {
                bookingList.innerHTML = '<p class="text-center p-4">No bookings found</p>';
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            bookingList.innerHTML = '<p class="text-center p-4 text-red-600">Error loading bookings</p>';
        }
    }

    // Handle edit property button
    const editButtons = document.querySelectorAll('.btn-secondary');
    editButtons.forEach(button => {
        if (button.textContent.includes('Edit')) {
            button.addEventListener('click', function() {
                alert('Edit property functionality coming soon!');
            });
        }
    });

    // Handle delete property button
    const deleteButtons = document.querySelectorAll('.btn-danger');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this property?')) {
                this.closest('.card').remove();
                alert('Property deleted successfully!');
            }
        });
    });
});

function displayBookings(bookings) {
    const bookingList = document.getElementById('booking-list');
    if (!bookingList) return;

    bookingList.innerHTML = bookings.map(booking => {
        const propertyName = booking.property?.name || booking.property || 'Unknown Property';
        const propertyLocation = booking.property?.location || '';
        const checkIn = booking.checkIn || booking.checkin;
        const checkOut = booking.checkOut || booking.checkout;
        const total = booking.total || 0;
        const status = booking.status || 'Confirmed';
        
        return `
            <div class="card p-4 mb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold text-lg">${propertyName}</h4>
                        ${propertyLocation ? `<p class="text-sm text-gray-600">${propertyLocation}</p>` : ''}
                        <p class="text-sm mt-2">Check-in: ${checkIn} | Check-out: ${checkOut}</p>
                        ${booking.guests ? `<p class="text-sm">Guests: ${booking.guests}</p>` : ''}
                        <p class="text-lg font-semibold mt-2 text-[var(--primary-color)]">Total: ${CurrencyConverter.formatDisplay(total)}</p>
                    </div>
                    <div>
                        <span class="px-3 py-1 rounded-full text-sm ${status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${status}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

