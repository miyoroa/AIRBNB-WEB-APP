<?php
/**
 * Helper Functions
 */

/**
 * Normalize location string for searching
 */
function normalizeLocation($location) {
    return strtolower(trim(preg_replace('/\s+/', ' ', $location)));
}

/**
 * Match location for search
 */
function matchLocation($propertyLocation, $searchLocation) {
    if (empty($propertyLocation)) {
        return false;
    }
    
    $propLoc = normalizeLocation($propertyLocation);
    $searchLoc = normalizeLocation($searchLocation);
    
    // Exact match (highest priority)
    if ($propLoc === $searchLoc) {
        return true;
    }
    
    // If search includes comma (full location), try exact match and flexible matching
    if (strpos($searchLoc, ',') !== false) {
        // Extract location name and country from search
        $searchParts = explode(',', $searchLoc);
        $searchName = trim($searchParts[0]);
        $searchCountry = count($searchParts) > 1 ? trim($searchParts[1]) : '';
        
        $propParts = explode(',', $propLoc);
        $propName = trim($propParts[0]);
        $propCountry = count($propParts) > 1 ? trim($propParts[1]) : '';
        
        // Match if both location name and country match exactly
        if ($searchName === $propName && $searchCountry === $propCountry) {
            return true;
        }
        
        // Match if location name matches exactly (handles variations in country name formatting)
        if ($searchName === $propName) {
            return true;
        }
        
        // Match if property location contains the full search string
        if (strpos($propLoc, $searchLoc) !== false) {
            return true;
        }
        
        return false;
    }
    
    // For partial searches without comma (e.g., "Kruger"), match properties that start with search term
    // This ensures "Kruger" matches "Kruger National Park, South Africa"
    if (strpos($propLoc, $searchLoc . ',') === 0 || strpos($propLoc, $searchLoc . ' ') === 0) {
        return true;
    }
    
    // Also check if the location name starts with the search term
    $propName = explode(',', $propLoc)[0];
    if (strpos($propName, $searchLoc) === 0) {
        return true;
    }
    
    return false;
}

/**
 * Format property data for response
 */
function formatProperty($property) {
    return [
        'id' => (int)$property['id'],
        'name' => $property['name'],
        'location' => $property['location'],
        'price' => (float)$property['price'],
        'type' => $property['type'],
        'rating' => (float)$property['rating'],
        'image' => $property['image'],
        'description' => $property['description'],
        'amenities' => json_decode($property['amenities'], true) ?? [],
        'hostId' => (int)$property['host_id'],
        'hostName' => $property['host_name'],
        'maxGuests' => (int)$property['max_guests'],
        'checkinTime' => $property['checkin_time'],
        'checkoutTime' => $property['checkout_time'],
        'locationDescription' => $property['location_description'],
        'cancellationPolicy' => $property['cancellation_policy'],
        'available' => (bool)$property['available'],
        'reviews' => [] // Will be loaded separately if needed
    ];
}

