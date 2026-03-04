document.addEventListener('DOMContentLoaded', async function() {
    const hostView = document.getElementById('host-view');
    const bookerView = document.getElementById('booker-view');

    // Check for authentication
    if (!window.SafariStaysAPI || !SafariStaysAPI.auth.isAuthenticated()) {
        const mainContent = document.querySelector('.container.mx-auto');
        if (mainContent) {
            mainContent.innerHTML = '<p class="text-center p-8 text-xl">Please <a href="login.html" class="text-blue-600 hover:underline">login</a> to view your bookings or dashboard.</p>';
        }
        return;
    }

    const user = SafariStaysAPI.getCurrentUser();

    if (user && user.role === 'host') {
        // --- HOST VIEW ---
        document.title = 'Host Dashboard - Safari Stays';
        hostView.classList.remove('hidden');
        bookerView.classList.add('hidden');
        
        const statsCards = hostView.querySelectorAll('.card p.text-2xl');
        const bookingList = document.getElementById('booking-list-host');

        // Load host stats
        try {
            const stats = await SafariStaysAPI.host.getStats();
            if (statsCards.length >= 4) {
                const earnings = stats.totalEarnings || stats.revenue || 0;
                const bookings = stats.totalBookings || stats.bookings || 0;
                const occupancy = stats.occupancyRate || 0;
                const rating = stats.averageRating || stats.avgRating || 0;
                
                statsCards[0].textContent = CurrencyConverter.formatDisplay(earnings);
                statsCards[1].textContent = bookings;
                statsCards[2].textContent = occupancy + '%';
                statsCards[3].textContent = rating.toFixed(1);
            }
        } catch (error) {
            console.error('Error loading host stats:', error);
        }

        // Load host bookings (bookings for their properties)
        if (bookingList) {
            try {
                const hostBookings = await SafariStaysAPI.bookings.getAll();

                if (hostBookings.length > 0) {
                    displayBookings(hostBookings, 'booking-list-host');
                } else {
                    bookingList.innerHTML = '<p class="text-center p-4">No bookings found for your properties.</p>';
                }
            } catch (error) {
                console.error('Error loading host bookings:', error);
                bookingList.innerHTML = '<p class="text-center p-4 text-red-600">Error loading bookings.</p>';
            }
        }

        // Load host properties
        await loadHostProperties();

    } else if (user && user.role === 'booker') {
        // --- BOOKER VIEW ---
        document.title = 'My Bookings - Safari Stays';
        hostView.classList.add('hidden');
        bookerView.classList.remove('hidden');

        const bookingList = document.getElementById('booking-list-booker');

        if (bookingList) {
            try {
                const userBookings = await SafariStaysAPI.bookings.getAll();

                if (userBookings.length > 0) {
                    displayBookings(userBookings, 'booking-list-booker');
                } else {
                    bookingList.innerHTML = '<p class="text-center p-4">You have no bookings yet. <a href="search.html" class="text-blue-600 hover:underline">Find a place to stay!</a></p>';
                }
            } catch (error) {
                console.error('Error loading your bookings:', error);
                bookingList.innerHTML = '<p class="text-center p-4 text-red-600">Error loading your bookings.</p>';
            }
        }
    } else {
        // Fallback for other roles or if role is not defined
        const mainContent = document.querySelector('.container.mx-auto');
        if (mainContent) {
            mainContent.innerHTML = '<p class="text-center p-8 text-xl">Your role is not configured to view this page.</p>';
        }
    }
});

// Load and display host properties
async function loadHostProperties() {
    const propertiesList = document.getElementById('properties-list');
    if (!propertiesList) return;

    try {
        const user = SafariStaysAPI.getCurrentUser();
        if (!user || user.role !== 'host') {
            propertiesList.innerHTML = '<p class="text-center p-4">Only hosts can manage properties</p>';
            return;
        }

        // Get all properties and filter by host
        const allProperties = await SafariStaysAPI.properties.getAll();
        const hostProperties = allProperties.filter(p => p.hostId === user.id);

        if (hostProperties.length === 0) {
            propertiesList.innerHTML = '<p class="text-center p-4">You haven\'t listed any properties yet.</p>';
            return;
        }

        propertiesList.innerHTML = hostProperties.map(property => `
            <div class="card p-4 flex justify-between items-center mb-4" data-property-id="${property.id}">
                <div class="flex-1">
                    <h4 class="font-bold text-lg">${property.name}</h4>
                    <p class="text-sm text-gray-600">${property.location}</p>
                    <p class="text-sm mt-1 text-[var(--primary-color)] font-semibold">${CurrencyConverter.formatDisplay(property.price)} / night</p>
                    <p class="text-xs text-gray-500 mt-1">Type: ${property.type} | Rating: ${property.rating || 0} ⭐</p>
                </div>
                <div class="flex gap-2 ml-4">
                    <button class="btn-secondary edit-property-btn" data-property-id="${property.id}">Edit</button>
                    <button class="btn-danger delete-property-btn" data-property-id="${property.id}">Delete</button>
                </div>
            </div>
        `).join('');

        // Attach event listeners
        attachPropertyEventListeners();
    } catch (error) {
        console.error('Error loading properties:', error);
        propertiesList.innerHTML = '<p class="text-center p-4 text-red-600">Error loading properties</p>';
    }
}

// Attach event listeners to property buttons
function attachPropertyEventListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-property-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const propertyId = this.getAttribute('data-property-id');
            await openEditModal(propertyId);
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-property-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const propertyId = this.getAttribute('data-property-id');
            await deleteProperty(propertyId);
        });
    });
}

// Open edit modal with property data
async function openEditModal(propertyId) {
    try {
        const property = await SafariStaysAPI.properties.getById(propertyId);
        const modal = document.getElementById('edit-property-modal');
        
        // Populate form
        document.getElementById('edit-property-id').value = property.id;
        document.getElementById('edit-name').value = property.name;
        document.getElementById('edit-location').value = property.location;
        document.getElementById('edit-price').value = property.price;
        document.getElementById('edit-type').value = property.type;
        document.getElementById('edit-description').value = property.description;
        document.getElementById('edit-max-guests').value = property.maxGuests || 4;
        document.getElementById('edit-rating').value = property.rating || 0;
        document.getElementById('edit-checkin-time').value = property.checkinTime || '';
        document.getElementById('edit-checkout-time').value = property.checkoutTime || '';
        document.getElementById('edit-image').value = property.image || '';
        document.getElementById('edit-location-description').value = property.locationDescription || '';
        document.getElementById('edit-cancellation-policy').value = property.cancellationPolicy || '';
        document.getElementById('edit-available').checked = property.available !== false;
        
        // Show modal
        modal.classList.remove('hidden');
    } catch (error) {
        console.error('Error loading property:', error);
        alert('Error loading property details');
    }
}

// Close edit modal
function closeEditModal() {
    const modal = document.getElementById('edit-property-modal');
    modal.classList.add('hidden');
    document.getElementById('edit-property-form').reset();
}

// Handle edit form submission
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('edit-property-form');
    const closeBtn = document.getElementById('close-edit-modal');
    const cancelBtn = document.getElementById('cancel-edit');

    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const propertyId = document.getElementById('edit-property-id').value;
            const propertyData = {
                name: document.getElementById('edit-name').value,
                location: document.getElementById('edit-location').value,
                price: parseFloat(document.getElementById('edit-price').value),
                type: document.getElementById('edit-type').value,
                description: document.getElementById('edit-description').value,
                maxGuests: parseInt(document.getElementById('edit-max-guests').value),
                rating: parseFloat(document.getElementById('edit-rating').value),
                checkinTime: document.getElementById('edit-checkin-time').value,
                checkoutTime: document.getElementById('edit-checkout-time').value,
                image: document.getElementById('edit-image').value,
                locationDescription: document.getElementById('edit-location-description').value,
                cancellationPolicy: document.getElementById('edit-cancellation-policy').value,
                available: document.getElementById('edit-available').checked
            };

            try {
                await SafariStaysAPI.properties.update(propertyId, propertyData);
                alert('Property updated successfully!');
                closeEditModal();
                await loadHostProperties(); // Reload properties
            } catch (error) {
                console.error('Error updating property:', error);
                alert('Error updating property: ' + (error.message || 'Unknown error'));
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeEditModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeEditModal);
    }

    // Close modal on outside click
    const modal = document.getElementById('edit-property-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeEditModal();
            }
        });
    }
});

// Delete property
async function deleteProperty(propertyId) {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
        return;
    }

    try {
        await SafariStaysAPI.properties.delete(propertyId);
        alert('Property deleted successfully!');
        await loadHostProperties(); // Reload properties
    } catch (error) {
        console.error('Error deleting property:', error);
        alert('Error deleting property: ' + (error.message || 'Unknown error'));
    }
}

function displayBookings(bookings, containerId) {
    const bookingList = document.getElementById(containerId);
    if (!bookingList) return;

    bookingList.innerHTML = bookings.map(booking => {
        const propertyName = booking.property?.name || 'Unknown Property';
        const propertyLocation = booking.property?.location || '';
        const checkIn = booking.checkIn || booking.checkin;
        const checkOut = booking.checkOut || booking.checkout;
        const total = booking.total || 0;
        const status = booking.status || 'Confirmed';
        
        // Add a cancel button for bookers
        const user = SafariStaysAPI.getCurrentUser();
        let actionButton = '';
        if (user && user.role === 'booker') {
            actionButton = `<button class="btn-danger mt-2" onclick="cancelBooking(${booking.id})">Cancel Booking</button>`;
        }

        return `
            <div class="card p-4 mb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold text-lg">${propertyName}</h4>
                        ${propertyLocation ? `<p class="text-sm text-gray-600">${propertyLocation}</p>` : ''}
                        <p class="text-sm mt-2">Check-in: ${checkIn} | Check-out: ${checkOut}</p>
                        ${booking.guests ? `<p class="text-sm">Guests: ${booking.guests}</p>` : ''}
                        <p class="text-lg font-semibold mt-2 text-[var(--primary-color)]">Total: ${CurrencyConverter.formatDisplay(total)}</p>
                        ${actionButton}
                    </div>
                    <div>
                        <span class="px-3 py-1 rounded-full text-sm ${status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${status}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Function to cancel a booking (for bookers)
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    try {
        await SafariStaysAPI.bookings.delete(bookingId);
        alert('Booking cancelled successfully.');
        // Reload the page or just the booking list
        window.location.reload();
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking: ' + (error.message || 'Please try again.'));
    }
}

