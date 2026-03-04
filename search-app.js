// Search functionality for Safari Stays
document.addEventListener('DOMContentLoaded', async function() {
    const priceRange = document.getElementById('price-range');
    const propertyType = document.getElementById('property-type');
    const minRating = document.getElementById('min-rating');
    const propertiesContainer = document.getElementById('properties-container');
    const locationInput = document.getElementById('search-location-input');
    const resultsHeader = document.getElementById('search-results-header');
    const resultsTitle = document.getElementById('results-title');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');

    let allProperties = [];

    // Load properties from API
    async function loadProperties() {
        try {
            console.log('Loading properties from API...');
            allProperties = await SafariStaysAPI.properties.getAll();
            console.log(`Loaded ${allProperties.length} properties from API`);
            
            // Remove duplicates by ID
            const uniqueProperties = [];
            const seenIds = new Set();
            allProperties.forEach(property => {
                if (!seenIds.has(property.id)) {
                    seenIds.add(property.id);
                    uniqueProperties.push(property);
                }
            });
            allProperties = uniqueProperties;
            console.log(`After removing duplicates: ${allProperties.length} unique properties`);
            
            // Populate property type dropdown dynamically
            populatePropertyTypes();
            
            // Verify all locations have properties
            const uniqueLocations = [...new Set(allProperties.map(p => p.location))];
            console.log(`Properties available in ${uniqueLocations.length} locations`);
            
            // Check if location is selected from homepage search
            const stored = sessionStorage.getItem('searchParams');
            if (stored) {
                const params = JSON.parse(stored);
                if (params.location && locationInput) {
                    locationInput.value = params.location;
                    console.log('Applying stored search location:', params.location);
                    filterProperties();
                } else {
                    renderProperties(allProperties);
                }
            } else {
                renderProperties(allProperties);
            }

            // Listen for currency changes
            window.addEventListener('currencyChanged', function() {
                filterProperties();
            });
        } catch (error) {
            console.error('Error loading properties:', error);
            alert('Error loading properties. Please make sure the server is running on http://localhost:3000');
            // Fallback to static data if API fails (African properties)
            allProperties = [
                { id: 1, name: 'Luxury Safari Lodge', location: 'Serengeti, Tanzania', price: 450, type: 'Luxury Lodge', rating: 4.8, image: 'images/lodge.jpg', hostName: 'Safari Adventures Co.', description: 'Premium lodge with world-class amenities and stunning Serengeti views' },
                { id: 3, name: 'Wilderness Tree Camp', location: 'Kruger National Park, South Africa', price: 320, type: 'Tree Camp', rating: 4.5, image: 'images/tree.jpg', hostName: 'Wilderness Escapes', description: 'Unique elevated camp offering authentic wilderness experience' },
                { id: 5, name: 'Mountain View Lodge', location: 'Masai Mara, Kenya', price: 410, type: 'Luxury Lodge', rating: 4.7, image: 'images/mountainView.jpg', hostName: 'Mountain Retreats', description: 'Elegant lodge with panoramic mountain and savanna views' },
                { id: 7, name: 'Riverside Safari Camp', location: 'Okavango Delta, Botswana', price: 380, type: 'Luxury Lodge', rating: 4.9, image: 'images/delta.jpg', hostName: 'Delta Experiences', description: 'Waterfront camp with unique water-based safari activities' },
                { id: 9, name: 'Desert Safari Villa', location: 'Namib Desert, Namibia', price: 280, type: 'Desert Villa', rating: 4.2, image: 'images/villa.jpg', hostName: 'Desert Dreams', description: 'Modern villa with panoramic desert views and luxury amenities' },
                { id: 11, name: 'Cape Town Waterfront Apartment', location: 'Cape Town, South Africa', price: 150, type: 'Apartment', rating: 4.8, image: 'images/lodge.jpg', hostName: 'Cape Town Stays', description: 'Modern apartment in vibrant waterfront area with Table Mountain views' },
                { id: 13, name: 'Ngorongoro Crater Lodge', location: 'Ngorongoro Crater, Tanzania', price: 520, type: 'Luxury Lodge', rating: 4.9, image: 'images/mountainView.jpg', hostName: 'Crater Experiences', description: 'Luxury lodge on the rim of Ngorongoro Crater with breathtaking views' }
            ];
            populatePropertyTypes();
            renderProperties(allProperties);
        }
    }
    
    // Populate property type dropdown with unique types from properties
    function populatePropertyTypes() {
        if (!propertyType) return;
        
        // Get unique property types from all properties
        const uniqueTypes = [...new Set(allProperties.map(p => p.type).filter(Boolean))].sort();
        
        // Clear existing options except "All Types"
        propertyType.innerHTML = '<option value="All Types">All Types</option>';
        
        // Add each unique type
        uniqueTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            propertyType.appendChild(option);
        });
        
        console.log(`Populated property types: ${uniqueTypes.join(', ')}`);
    }

    // Render properties with full details
    function renderProperties(properties) {
        if (!propertiesContainer) return;
        
        // Remove duplicates by ID before rendering (final safety check)
        const uniqueProperties = [];
        const seenIds = new Set();
        properties.forEach(property => {
            if (!seenIds.has(property.id)) {
                seenIds.add(property.id);
                uniqueProperties.push(property);
            }
        });
        properties = uniqueProperties;
        
        if (properties.length === 0) {
            propertiesContainer.classList.add('hidden');
            if (noResults) {
                noResults.classList.remove('hidden');
                const location = locationInput?.value || '';
                if (location) {
                    noResults.innerHTML = `
                        <p class="text-gray-600 text-lg">No properties found for "${location}"</p>
                        <p class="text-gray-500 mt-2">Please check the spelling or try a different location.</p>
                        <p class="text-gray-500 mt-1 text-sm">Make sure the server is running on http://localhost:3000</p>
                    `;
                }
            }
            if (resultsHeader) resultsHeader.classList.add('hidden');
            return;
        }
        
        propertiesContainer.classList.remove('hidden');
        if (noResults) noResults.classList.add('hidden');
        
        // Show results header if location is selected
        const location = locationInput?.value || '';
        if (location && resultsHeader && resultsTitle && resultsCount) {
            resultsHeader.classList.remove('hidden');
            resultsTitle.textContent = `Properties in ${location}`;
            resultsCount.textContent = `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} available`;
        } else if (resultsHeader) {
            resultsHeader.classList.add('hidden');
        }
        
        propertiesContainer.innerHTML = properties.map(property => {
            const rating = property.rating || 0;
            const reviewCount = property.reviews?.length || 0;
            const hostName = property.hostName || 'Host';
            const propertyType = property.type || 'Luxury Lodge';
            
            return `
                <div class="card">
                    <img src="/${property.image}" alt="${property.name}" style="height: 250px; object-fit: cover;" onerror="this.src='/images/lodge.jpg'; this.onerror=null;" />
                    <div class="p-4">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-bold text-lg">${property.name}</h4>
                            <div class="flex items-center">
                                <span class="text-yellow-500">★</span>
                                <span class="ml-1 font-semibold">${rating.toFixed(1)}</span>
                            </div>
                        </div>
                        <p class="text-gray-600 text-sm mb-1">${property.location}</p>
                        <p class="text-sm font-medium text-[var(--primary-color)] mb-1">
                            <span class="px-2 py-1 bg-gray-100 rounded-full">${propertyType}</span>
                        </p>
                        <p class="text-sm text-gray-500 mb-2">Hosted by <span class="font-semibold">${hostName}</span></p>
                        <p class="text-lg font-bold text-[var(--primary-color)] mb-2">${CurrencyConverter.formatDisplay(property.price)} / night</p>
                        ${reviewCount > 0 ? `<p class="text-xs text-gray-500 mb-2">${reviewCount} review${reviewCount > 1 ? 's' : ''}</p>` : ''}
                        <button class="btn-secondary w-full" onclick="viewProperty(this)" data-property-id="${property.id}">View Details</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Filter function
    async function filterProperties() {
        const maxPrice = parseInt(priceRange?.value || 1000);
        const selectedType = propertyType?.value || 'All Types';
        const minRatingValue = parseFloat(minRating?.value) || 0;
        const location = (locationInput?.value || '').trim();

        console.log('Filtering properties with location:', location);

        try {
            const filters = {
                maxPrice: maxPrice.toString(),
                minRating: minRatingValue > 0 ? minRatingValue.toString() : undefined
            };
            if (location) {
                filters.location = location;
            }
            if (selectedType !== 'All Types') filters.type = selectedType;

            console.log('Sending filters:', filters);
            let filtered = await SafariStaysAPI.properties.getAll(filters);
            console.log('Received properties:', filtered.length);
            
            // Remove duplicates by ID to ensure no property appears twice
            const uniqueFiltered = [];
            const seenIds = new Set();
            filtered.forEach(property => {
                if (!seenIds.has(property.id)) {
                    seenIds.add(property.id);
                    uniqueFiltered.push(property);
                }
            });
            filtered = uniqueFiltered;
            console.log(`After removing duplicates: ${filtered.length} unique properties`);
            
            renderProperties(filtered);
        } catch (error) {
            console.error('Error filtering properties:', error);
            // Client-side filtering as fallback
            const filtered = allProperties.filter(property => {
                const matchesPrice = property.price <= maxPrice;
                const matchesType = selectedType === 'All Types' || property.type === selectedType;
                const matchesRating = (property.rating || 0) >= minRatingValue;
                
                // Improved location matching
                let matchesLocation = true;
                if (location) {
                    const searchLocation = location.toLowerCase().trim();
                    const propLocation = property.location.toLowerCase().trim();
                    
                    // Exact match (highest priority) - handles full location searches like "Serengeti, Tanzania"
                    if (propLocation === searchLocation) {
                        matchesLocation = true;
                    }
                    // If search includes comma (full location like "Serengeti, Tanzania"), only exact match allowed
                    else if (searchLocation.includes(',')) {
                        matchesLocation = false; // Require exact match for full location searches
                    }
                    // For partial searches without comma (e.g., "Serengeti"), match properties that start with search term followed by comma
                    // This ensures "Serengeti" matches "Serengeti, Tanzania" but NOT "Ngorongoro Crater, Tanzania"
                    else {
                        matchesLocation = propLocation.startsWith(searchLocation + ',');
                    }
                }
                
                return matchesPrice && matchesType && matchesRating && matchesLocation;
            });
            
            // Remove duplicates by ID to ensure no property appears twice
            const uniqueFiltered = [];
            const seenIds = new Set();
            filtered.forEach(property => {
                if (!seenIds.has(property.id)) {
                    seenIds.add(property.id);
                    uniqueFiltered.push(property);
                }
            });
            filtered = uniqueFiltered;
            
            console.log(`Filtered ${filtered.length} unique properties`);
            renderProperties(filtered);
        }
    }
    
    // Listen for location input changes
    if (locationInput) {
        locationInput.addEventListener('input', function() {
            if (this.value) {
                filterProperties();
            } else {
                renderProperties(allProperties);
            }
        });
        
        locationInput.addEventListener('change', function() {
            if (this.value) {
                filterProperties();
            }
        });
    }

    // Set up filter event listeners
    if (priceRange) {
        const priceDisplay = document.getElementById('price-display');
        if (priceDisplay) {
            priceDisplay.textContent = priceRange.value;
        }
        priceRange.addEventListener('input', function() {
            if (priceDisplay) {
                priceDisplay.textContent = this.value;
            }
            filterProperties();
        });
    }

    if (propertyType) {
        propertyType.addEventListener('change', filterProperties);
    }

    if (minRating) {
        minRating.addEventListener('change', filterProperties);
    }
    
    // Make filterProperties available globally for performSearch
    window.filterProperties = filterProperties;
    
    // Load properties on page load (after all listeners are set up)
    await loadProperties();
});

// View property function
async function viewProperty(button) {
    const propertyId = button.getAttribute('data-property-id');
    
    if (!propertyId) {
        console.error('No property ID found');
        alert('Error: Property ID not found. Please try again.');
        return;
    }
    
    try {
        // Try to get property from API
        const property = await SafariStaysAPI.properties.getById(propertyId);
        sessionStorage.setItem('selectedProperty', JSON.stringify({
            id: property.id,
            title: property.name,
            location: property.location,
            price: property.price
        }));
        window.location.href = 'property-detail.html';
    } catch (error) {
        console.error('Error loading property:', error);
        
        // Fallback: try to get property from allProperties array
        try {
            const allProperties = await SafariStaysAPI.properties.getAll();
            const property = allProperties.find(p => p.id === parseInt(propertyId) || p.id === propertyId);
            
            if (property) {
                sessionStorage.setItem('selectedProperty', JSON.stringify({
                    id: property.id,
                    title: property.name,
                    location: property.location,
                    price: property.price
                }));
                window.location.href = 'property-detail.html';
                return;
            }
        } catch (searchError) {
            console.error('Error searching properties:', searchError);
        }
        
        // Last resort: use card data
        const card = button.closest('.card');
        if (card) {
            const title = card.querySelector('h4')?.textContent || 'Property';
            const location = card.querySelectorAll('p')[0]?.textContent || '';
            const priceText = card.querySelectorAll('p')[1]?.textContent || '';
            
            sessionStorage.setItem('selectedProperty', JSON.stringify({
                id: propertyId,
                title: title,
                location: location,
                price: priceText
            }));
            window.location.href = 'property-detail.html';
        } else {
            alert('Error loading property details. Please make sure the server is running.');
        }
    }
}

// Search functionality
function performSearch() {
    const location = document.getElementById('search-location-input')?.value || '';
    const checkin = document.getElementById('search-checkin-input')?.value || '';
    const checkout = document.getElementById('search-checkout-input')?.value || '';
    const guests = document.getElementById('search-guests-input')?.value || '2';

    // Store search parameters
    sessionStorage.setItem('searchParams', JSON.stringify({
        location: location,
        checkin: checkin,
        checkout: checkout,
        guests: guests
    }));

    // Apply filters - call filterProperties if available
    if (window.filterProperties) {
        window.filterProperties();
    } else {
        // If not available yet, reload the page to trigger filter
        location.reload();
    }
}

// Load search parameters on page load
document.addEventListener('DOMContentLoaded', function() {
    const stored = sessionStorage.getItem('searchParams');
    if (stored) {
        const params = JSON.parse(stored);
        const locationInput = document.getElementById('search-location-input');
        const checkinInput = document.getElementById('search-checkin-input');
        const checkoutInput = document.getElementById('search-checkout-input');
        const guestsInput = document.getElementById('search-guests-input');

        if (locationInput && params.location) locationInput.value = params.location;
        if (checkinInput && params.checkin) {
            checkinInput.value = params.checkin;
            checkinInput.min = new Date().toISOString().split('T')[0];
        }
        if (checkoutInput && params.checkout) {
            checkoutInput.value = params.checkout;
            checkoutInput.min = checkinInput?.value || new Date().toISOString().split('T')[0];
        }
        if (guestsInput && params.guests) guestsInput.value = params.guests;

        // Set minimum dates
        const today = new Date().toISOString().split('T')[0];
        if (checkinInput) {
            checkinInput.min = today;
            checkinInput.addEventListener('change', function() {
                if (checkoutInput) checkoutInput.min = this.value;
            });
        }
        if (checkoutInput) checkoutInput.min = today;
    } else {
        // Set minimum dates even if no stored params
        const today = new Date().toISOString().split('T')[0];
        const checkinInput = document.getElementById('search-checkin-input');
        const checkoutInput = document.getElementById('search-checkout-input');
        if (checkinInput) {
            checkinInput.min = today;
            checkinInput.addEventListener('change', function() {
                if (checkoutInput) checkoutInput.min = this.value;
            });
        }
        if (checkoutInput) checkoutInput.min = today;
    }
});

