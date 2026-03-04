const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'safari-stays-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files (HTML, CSS, images)

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating data directory:', error);
    }
}

// Initialize data files
async function initializeData() {
    await ensureDataDir();
    
    // Initialize users.json
    try {
        await fs.access(USERS_FILE);
    } catch {
        await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
    }
    
    // Initialize properties.json with sample data
    try {
        await fs.access(PROPERTIES_FILE);
    } catch {
        const sampleProperties = [
            // Serengeti, Tanzania Properties
            {
                id: 1,
                name: 'Luxury Safari Lodge',
                location: 'Serengeti, Tanzania',
                price: 450,
                type: 'Luxury Lodge',
                rating: 4.8,
                image: 'images/lodge.jpg',
                description: 'Experience luxury in the heart of the Serengeti with stunning views and world-class amenities. This premium lodge offers spacious suites with private balconies overlooking the vast Serengeti plains. Wake up to the sounds of wildlife and enjoy gourmet meals prepared by our expert chefs. Perfect for couples and families seeking an unforgettable safari experience.',
                amenities: ['Wi-Fi', 'Pool', 'Kitchen', 'Parking', 'Safari Tours', 'Breakfast', 'Air Conditioning', 'Private Balcony', 'Restaurant', 'Bar'],
                hostId: 1,
                hostName: 'Safari Adventures Co.',
                maxGuests: 6,
                checkinTime: '3:00 PM',
                checkoutTime: '11:00 AM',
                locationDescription: 'Nestled in the heart of the Serengeti National Park, this lodge offers unparalleled access to the Great Migration route. Located just 2km from the main game viewing area, guests can witness the annual wildebeest migration from their private balconies. The property is surrounded by acacia trees and offers stunning sunset views over the savanna.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 1, userId: 2, userName: 'Sarah Johnson', rating: 5, comment: 'Absolutely amazing experience! The views were breathtaking. We saw elephants, lions, and even a leopard right from our balcony. The staff was incredibly friendly and knowledgeable about the wildlife.', date: '2024-12-15' },
                    { id: 2, userId: 3, userName: 'Michael Chen', rating: 4, comment: 'Great place, very comfortable and clean. The food was excellent and the safari tours were well-organized. Would definitely recommend!', date: '2024-11-20' }
                ]
            },
            {
                id: 2,
                name: 'Serengeti Plains Camp',
                location: 'Serengeti, Tanzania',
                price: 380,
                type: 'Luxury Lodge',
                rating: 4.6,
                image: 'images/tree.jpg',
                description: 'Authentic tented camp in the heart of the Serengeti plains with incredible wildlife viewing. Experience the true essence of African safari living in our luxury tents equipped with comfortable beds and en-suite bathrooms. The camp offers an intimate setting with only 12 tents, ensuring personalized service and exclusive wildlife encounters.',
                amenities: ['Wi-Fi', 'Safari Tours', 'Breakfast', 'Wildlife Viewing', 'En-suite Bathroom', 'Hot Water', 'Laundry Service', 'Evening Campfire'],
                hostId: 1,
                hostName: 'Serengeti Adventures',
                maxGuests: 4,
                checkinTime: '2:00 PM',
                checkoutTime: '10:00 AM',
                locationDescription: 'Situated in the central Serengeti plains, this camp provides front-row seats to the annual Great Migration. The camp is strategically located near water sources, attracting diverse wildlife throughout the year. Guests can enjoy game drives in the early morning and evening when animals are most active.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 3, userId: 4, userName: 'Emma Williams', rating: 5, comment: 'Amazing wildlife sightings right from camp! We saw a pride of lions hunting just meters away. The tent was comfortable and the staff made us feel at home. The evening campfire with storytelling was a highlight.', date: '2024-12-10' }
                ]
            },
            // Kruger National Park, South Africa Properties
            {
                id: 3,
                name: 'Wilderness Tree Camp',
                location: 'Kruger National Park, South Africa',
                price: 320,
                type: 'Tree Camp',
                rating: 4.5,
                image: 'images/tree.jpg',
                description: 'Sleep among the trees in this unique wilderness camp offering an authentic safari experience. Elevated platforms provide stunning views of the surrounding bushveld and wildlife. Wake up to the sounds of birds and experience the thrill of sleeping in the African wilderness while enjoying modern comforts.',
                amenities: ['Wi-Fi', 'Safari Tours', 'Breakfast', 'Wildlife Viewing', 'Elevated Platforms', 'En-suite Bathroom', 'Hot Water', 'Evening Campfire'],
                hostId: 1,
                hostName: 'Wilderness Escapes',
                maxGuests: 4,
                checkinTime: '2:00 PM',
                checkoutTime: '10:00 AM',
                locationDescription: 'Nestled in a private game reserve bordering Kruger National Park, this unique tree camp offers an elevated perspective of the African bush. The camp is strategically located near water sources, attracting regular wildlife visits. Guests can observe elephants, giraffes, and various antelope species from the elevated platforms.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 4, userId: 5, userName: 'David Brown', rating: 5, comment: 'Unique experience! Loved waking up to the sounds of nature.', date: '2024-12-10' }
                ]
            },
            {
                id: 4,
                name: 'Kruger Safari Villa',
                location: 'Kruger National Park, South Africa',
                price: 350,
                type: 'Luxury Lodge',
                rating: 4.7,
                image: 'images/villa.jpg',
                description: 'Spacious villa with private game viewing deck overlooking the Kruger National Park. This family-friendly accommodation features three bedrooms, a fully equipped kitchen, and a large living area. The private deck offers uninterrupted views of the park, perfect for morning coffee while watching wildlife.',
                amenities: ['Wi-Fi', 'Pool', 'Kitchen', 'Parking', 'Game Viewing Deck', '3 Bedrooms', 'Living Room', 'BBQ Area', 'Air Conditioning', 'Washing Machine'],
                hostId: 1,
                hostName: 'Kruger Stays',
                maxGuests: 8,
                checkinTime: '3:00 PM',
                checkoutTime: '11:00 AM',
                locationDescription: 'Situated on the edge of Kruger National Park with direct access to the park gates. The villa is located in a private game reserve area, offering exclusive wildlife viewing opportunities. The property is just 5 minutes drive from the main entrance, making it convenient for daily game drives.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 5, userId: 6, userName: 'Lisa Anderson', rating: 5, comment: 'Perfect for families, great game viewing! The villa was spacious and well-equipped. Our kids loved the pool and we saw elephants from the deck every morning. Highly recommend!', date: '2024-11-28' }
                ]
            },
            // Masai Mara, Kenya Properties
            {
                id: 5,
                name: 'Mountain View Lodge',
                location: 'Masai Mara, Kenya',
                price: 410,
                type: 'Luxury Lodge',
                rating: 4.7,
                image: 'images/mountainView.jpg',
                description: 'Luxury lodge with breathtaking mountain views and easy access to the Masai Mara National Reserve. Perched on a hilltop, this lodge offers panoramic vistas of the Mara plains and the surrounding mountains. Each suite features floor-to-ceiling windows, private balconies, and elegant African-inspired décor. Perfect for romantic getaways and special occasions.',
                amenities: ['Wi-Fi', 'Pool', 'Kitchen', 'Parking', 'Safari Tours', 'Breakfast', 'Spa', 'Restaurant', 'Bar', 'Private Balcony', 'Room Service'],
                hostId: 3,
                hostName: 'Mountain Retreats',
                maxGuests: 4,
                checkinTime: '3:00 PM',
                checkoutTime: '11:00 AM',
                locationDescription: 'Located on a private conservancy bordering the Masai Mara National Reserve, this lodge offers exclusive access to wildlife viewing areas. The elevated position provides stunning sunrise and sunset views over the savanna. The property is just 15 minutes drive from the reserve entrance, making it ideal for daily game drives.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 6, userId: 7, userName: 'James Wilson', rating: 5, comment: 'Spectacular views and excellent wildlife viewing opportunities. The lodge exceeded our expectations. We saw the Big Five during our stay and the staff went above and beyond to make our experience memorable.', date: '2024-12-01' }
                ]
            },
            {
                id: 6,
                name: 'Mara River Camp',
                location: 'Masai Mara, Kenya',
                price: 360,
                type: 'Tree Camp',
                rating: 4.5,
                image: 'images/delta.jpg',
                description: 'Riverside camp perfect for witnessing the Great Migration. This seasonal camp is strategically positioned along the Mara River, offering front-row seats to one of nature\'s greatest spectacles. The camp operates during migration season (July-October) and provides comfortable tented accommodation with river views. Experience the dramatic river crossings as thousands of wildebeest and zebra make their way across.',
                amenities: ['Wi-Fi', 'Safari Tours', 'Breakfast', 'Migration Viewing', 'River Views', 'Tented Accommodation', 'Hot Showers', 'Dining Tent', 'Evening Entertainment'],
                hostId: 3,
                hostName: 'Mara River Adventures',
                maxGuests: 4,
                checkinTime: '2:00 PM',
                checkoutTime: '10:00 AM',
                locationDescription: 'Positioned directly on the banks of the Mara River at a prime crossing point, this camp offers unparalleled views of the Great Migration. The location is carefully chosen based on years of migration patterns, ensuring guests witness the most dramatic crossings. Crocodiles and hippos are frequently seen in the river, adding to the excitement.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 7, userId: 8, userName: 'Robert Taylor', rating: 5, comment: 'Witnessed the migration - unforgettable! We saw thousands of wildebeest crossing the river right in front of our tent. The camp was comfortable and the guides were incredibly knowledgeable. A once-in-a-lifetime experience!', date: '2024-11-25' }
                ]
            },
            // Okavango Delta, Botswana Properties
            {
                id: 7,
                name: 'Riverside Safari Camp',
                location: 'Okavango Delta, Botswana',
                price: 380,
                type: 'Luxury Lodge',
                rating: 4.9,
                image: 'images/delta.jpg',
                description: 'Waterfront camp in the Okavango Delta offering unique water-based safari experiences. This eco-friendly camp floats on the delta waters, providing an immersive experience in one of Africa\'s most unique ecosystems. Enjoy mokoro (traditional canoe) rides, bird watching, and close encounters with hippos and crocodiles in their natural habitat.',
                amenities: ['Wi-Fi', 'Pool', 'Safari Tours', 'Breakfast', 'Mokoro Rides', 'Water Activities', 'Bird Watching', 'Fishing', 'Eco-Friendly'],
                hostId: 2,
                hostName: 'Delta Experiences',
                maxGuests: 4,
                checkinTime: '2:00 PM',
                checkoutTime: '10:00 AM',
                locationDescription: 'Floating on the pristine waters of the Okavango Delta, this camp provides access to remote channels and islands inaccessible by land. The delta is home to over 400 bird species and diverse wildlife including elephants, hippos, and rare sitatunga antelope. The camp moves seasonally to follow the best wildlife viewing areas.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 8, userId: 9, userName: 'Maria Garcia', rating: 5, comment: 'Best safari experience ever! The water activities were incredible. We glided through the delta channels in mokoros and saw elephants swimming. The camp staff were amazing and the food was delicious.', date: '2024-12-05' },
                    { id: 9, userId: 10, userName: 'John Smith', rating: 5, comment: 'Outstanding service and location. Highly recommend! The delta is magical and this camp offers the perfect way to experience it. We saw so much wildlife and the sunsets were breathtaking.', date: '2024-11-30' }
                ]
            },
            {
                id: 8,
                name: 'Delta Waterfront Lodge',
                location: 'Okavango Delta, Botswana',
                price: 420,
                type: 'Luxury Lodge',
                rating: 4.7,
                image: 'images/lodge.jpg',
                description: 'Luxury lodge with mokoro (canoe) excursions into the delta channels. This permanent lodge offers the perfect blend of comfort and adventure, with spacious suites featuring private decks overlooking the delta. Professional guides lead daily mokoro excursions and walking safaris, providing intimate wildlife encounters.',
                amenities: ['Wi-Fi', 'Pool', 'Mokoro Tours', 'Breakfast', 'Water Activities', 'Walking Safaris', 'Spa', 'Restaurant', 'Bar', 'Private Deck'],
                hostId: 2,
                hostName: 'Delta Waterfront',
                maxGuests: 6,
                checkinTime: '3:00 PM',
                checkoutTime: '11:00 AM',
                locationDescription: 'Perched on the edge of the Okavango Delta with direct water access, this lodge offers year-round delta experiences. The location provides easy access to both water-based activities and traditional game drives. The delta\'s seasonal flooding creates a dynamic landscape that changes throughout the year.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 10, userId: 11, userName: 'Sophie Martin', rating: 5, comment: 'Mokoro rides were magical! The guides were so knowledgeable about the delta ecosystem. The lodge was luxurious and the food was exceptional. We saw elephants, hippos, and countless birds.', date: '2024-12-03' }
                ]
            },
            // Namib Desert, Namibia Properties
            {
                id: 9,
                name: 'Desert Safari Villa',
                location: 'Namib Desert, Namibia',
                price: 280,
                type: 'Desert Villa',
                rating: 4.2,
                image: 'images/villa.jpg',
                description: 'Modern villa in the stunning Namib Desert with panoramic desert views and luxury amenities. This contemporary desert retreat offers a unique blend of comfort and isolation, perfect for those seeking tranquility and stargazing opportunities. The villa features floor-to-ceiling windows, a private pool, and a rooftop terrace for sunset viewing.',
                amenities: ['Wi-Fi', 'Pool', 'Kitchen', 'Parking', 'Desert Views', 'Rooftop Terrace', 'Air Conditioning', 'Stargazing Deck', 'BBQ Facilities'],
                hostId: 2,
                hostName: 'Desert Dreams',
                maxGuests: 4,
                checkinTime: '3:00 PM',
                checkoutTime: '11:00 AM',
                locationDescription: 'Located in the heart of the Namib Desert, this villa offers complete isolation and stunning desert landscapes. The property is surrounded by ancient sand dunes and provides easy access to desert activities like dune climbing and desert walks. The clear desert skies offer exceptional stargazing opportunities.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 11, userId: 12, userName: 'Thomas Lee', rating: 4, comment: 'Beautiful location, perfect for stargazing. The desert views are incredible and the villa is well-equipped. The nights are magical with the star-filled sky.', date: '2024-11-25' }
                ]
            },
            {
                id: 10,
                name: 'Sossusvlei Desert Lodge',
                location: 'Namib Desert, Namibia',
                price: 320,
                type: 'Desert Villa',
                rating: 4.5,
                image: 'images/savanna.jpg',
                description: 'Luxury desert lodge near the famous Sossusvlei dunes. Experience the world\'s oldest desert from this elegant lodge featuring spacious suites with private decks. Wake up early to witness the sunrise over the iconic red dunes, some of the tallest in the world. The lodge offers guided dune tours and desert excursions.',
                amenities: ['Wi-Fi', 'Pool', 'Kitchen', 'Parking', 'Dune Tours', 'Desert Excursions', 'Restaurant', 'Bar', 'Spa', 'Private Deck'],
                hostId: 2,
                hostName: 'Desert Dunes',
                maxGuests: 6,
                checkinTime: '2:00 PM',
                checkoutTime: '10:00 AM',
                locationDescription: 'Situated just 5km from the famous Sossusvlei dunes, this lodge provides convenient access to one of Namibia\'s most iconic attractions. The location offers stunning views of the red dunes and the surrounding desert landscape. Early morning dune climbs provide breathtaking sunrise views over the desert.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 12, userId: 13, userName: 'Amanda White', rating: 5, comment: 'Sunrise over the dunes was spectacular! The lodge was comfortable and the staff organized perfect dune tours. The colors of the desert at sunrise are indescribable. Highly recommend!', date: '2024-12-12' }
                ]
            },
            // Cape Town, South Africa Properties
            {
                id: 11,
                name: 'Cape Town Waterfront Apartment',
                location: 'Cape Town, South Africa',
                price: 150,
                type: 'Apartment',
                rating: 4.8,
                image: 'images/lodge.jpg',
                description: 'Modern apartment in the heart of Cape Town with stunning views of Table Mountain. This stylish two-bedroom apartment is located in the vibrant V&A Waterfront area, within walking distance of restaurants, shops, and attractions. The apartment features contemporary décor, a fully equipped kitchen, and a balcony with mountain views.',
                amenities: ['Wi-Fi', 'Kitchen', 'Parking', 'City Center', 'Mountain Views', 'Balcony', 'Washing Machine', 'Air Conditioning', 'TV', 'Near Restaurants'],
                hostId: 3,
                hostName: 'Cape Town Stays',
                maxGuests: 4,
                checkinTime: '3:00 PM',
                checkoutTime: '11:00 AM',
                locationDescription: 'Located in the V&A Waterfront, Cape Town\'s premier shopping and dining destination. The apartment is just steps away from the harbor, restaurants, and entertainment venues. Table Mountain is visible from the balcony, and the location provides easy access to Robben Island ferries, the Two Oceans Aquarium, and the city center.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 13, userId: 14, userName: 'Kevin Park', rating: 5, comment: 'Perfect location, beautiful views! The apartment was clean, modern, and well-equipped. We loved being able to walk to restaurants and shops. The Table Mountain view from the balcony was amazing.', date: '2024-12-08' }
                ]
            },
            // Victoria Falls, Zambia Properties
            {
                id: 12,
                name: 'Victoria Falls View Lodge',
                location: 'Victoria Falls, Zambia',
                price: 310,
                type: 'Luxury Lodge',
                rating: 4.6,
                image: 'images/mountainView.jpg',
                description: 'Luxury lodge with views of Victoria Falls and the Zambezi River. This elegant lodge offers spacious rooms with private balconies overlooking the "Smoke that Thunders". Wake up to the sound of the falls and enjoy world-class amenities including a spa, restaurant, and bar. Perfect for couples and families seeking adventure.',
                amenities: ['Wi-Fi', 'Pool', 'Safari Tours', 'Breakfast', 'Falls View', 'Spa', 'Restaurant', 'Bar', 'Adventure Activities', 'Private Balcony'],
                hostId: 3,
                hostName: 'Victoria Falls Stays',
                maxGuests: 4,
                checkinTime: '3:00 PM',
                checkoutTime: '11:00 AM',
                locationDescription: 'Perched on the edge of the Zambezi Gorge, this lodge offers spectacular views of Victoria Falls, one of the Seven Natural Wonders of the World. The location provides easy access to the falls, bungee jumping, white-water rafting, and helicopter tours. The lodge is just 2km from the falls entrance.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 14, userId: 15, userName: 'Ahmed Al-Mansoori', rating: 5, comment: 'The falls view is incredible! We could see the mist rising from our balcony. The lodge organized amazing activities including a helicopter ride over the falls. The staff was friendly and helpful.', date: '2024-12-07' }
                ]
            },
            // Ngorongoro Crater, Tanzania Properties
            {
                id: 13,
                name: 'Ngorongoro Crater Lodge',
                location: 'Ngorongoro Crater, Tanzania',
                price: 520,
                type: 'Luxury Lodge',
                rating: 4.9,
                image: 'images/mountainView.jpg',
                description: 'Luxury lodge on the rim of Ngorongoro Crater with breathtaking views. This exclusive lodge offers the ultimate safari experience with panoramic views of the crater floor below. Each suite features a private deck, fireplace, and elegant African-inspired décor. The lodge provides guided crater descents and game drives.',
                amenities: ['Wi-Fi', 'Pool', 'Safari Tours', 'Breakfast', 'Crater View', 'Spa', 'Fine Dining', 'Bar', 'Private Deck', 'Fireplace', 'Game Drives'],
                hostId: 1,
                hostName: 'Crater Experiences',
                maxGuests: 4,
                checkinTime: '2:00 PM',
                checkoutTime: '10:00 AM',
                locationDescription: 'Located on the rim of the Ngorongoro Crater at 2,400 meters above sea level, this lodge offers unparalleled views of the crater floor. The Ngorongoro Crater is a UNESCO World Heritage Site and home to the highest density of wildlife in Africa. The crater floor is home to over 25,000 animals including the Big Five.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 15, userId: 16, userName: 'Jennifer Davis', rating: 5, comment: 'The crater views are absolutely stunning! We descended into the crater and saw incredible wildlife including rhinos, lions, and elephants. The lodge was luxurious and the food was exceptional. A truly unforgettable experience!', date: '2024-12-05' }
                ]
            },
            // Bwindi Impenetrable Forest, Uganda Properties
            {
                id: 14,
                name: 'Bwindi Gorilla Lodge',
                location: 'Bwindi Impenetrable Forest, Uganda',
                price: 400,
                type: 'Luxury Lodge',
                rating: 4.8,
                image: 'images/tree.jpg',
                description: 'Lodge near Bwindi Impenetrable Forest, perfect for gorilla trekking experiences. This eco-friendly lodge offers comfortable accommodation in the heart of gorilla country. The lodge organizes gorilla trekking permits and provides experienced guides. After your trek, relax in the lodge\'s restaurant and bar while sharing stories with fellow travelers.',
                amenities: ['Wi-Fi', 'Safari Tours', 'Breakfast', 'Gorilla Trekking', 'Eco-Friendly', 'Restaurant', 'Bar', 'Guided Treks', 'Permit Assistance', 'Gift Shop'],
                hostId: 4,
                hostName: 'Bwindi Adventures',
                maxGuests: 4,
                checkinTime: '2:00 PM',
                checkoutTime: '10:00 AM',
                locationDescription: 'Nestled on the edge of Bwindi Impenetrable National Park, home to half of the world\'s remaining mountain gorillas. The lodge is located near multiple gorilla families, increasing your chances of successful encounters. The forest is also home to over 350 bird species and other primates including chimpanzees.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee. Note: Gorilla permits are non-refundable.',
                available: true,
                reviews: [
                    { id: 16, userId: 17, userName: 'Robert Taylor', rating: 5, comment: 'Incredible gorilla encounter! We spent an hour with a gorilla family and it was life-changing. The lodge helped organize everything and the guides were excellent. The forest is beautiful and the experience was worth every penny.', date: '2024-12-01' }
                ]
            },
            // Marrakech, Morocco Properties
            {
                id: 15,
                name: 'Marrakech Riad',
                location: 'Marrakech, Morocco',
                price: 120,
                type: 'Luxury Lodge',
                rating: 4.7,
                image: 'images/villa.jpg',
                description: 'Traditional Moroccan riad in the heart of Marrakech medina. This beautifully restored 18th-century riad features a central courtyard with a fountain, traditional Moroccan tiles, and comfortable rooms. Experience authentic Moroccan hospitality, enjoy traditional mint tea, and explore the vibrant souks just steps away.',
                amenities: ['Wi-Fi', 'Pool', 'Kitchen', 'Parking', 'Cultural Tours', 'Traditional Architecture', 'Central Courtyard', 'Rooftop Terrace', 'Hammam', 'Restaurant'],
                hostId: 5,
                hostName: 'Marrakech Heritage',
                maxGuests: 6,
                checkinTime: '3:00 PM',
                checkoutTime: '11:00 AM',
                locationDescription: 'Located in the heart of the Marrakech medina, a UNESCO World Heritage Site. The riad is just a 5-minute walk from Jemaa el-Fnaa square, the main souks, and historical sites like the Koutoubia Mosque and Bahia Palace. The location offers an authentic Marrakech experience with easy access to all major attractions.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 17, userId: 18, userName: 'Emma Williams', rating: 5, comment: 'Authentic Moroccan experience! The riad is beautiful with traditional architecture. The location is perfect for exploring the medina. The staff was welcoming and helped us navigate the souks. Highly recommend!', date: '2024-12-10' }
                ]
            },
            // Cairo, Egypt Properties
            {
                id: 16,
                name: 'Pyramids View Hotel',
                location: 'Cairo, Egypt',
                price: 180,
                type: 'Luxury Lodge',
                rating: 4.6,
                image: 'images/lodge.jpg',
                description: 'Hotel with stunning views of the Great Pyramids of Giza. This modern hotel offers comfortable rooms with pyramid views, a rooftop pool, and a restaurant. Wake up to views of the ancient pyramids and enjoy easy access to the Giza Plateau. The hotel organizes pyramid tours and camel rides.',
                amenities: ['Wi-Fi', 'Pool', 'Kitchen', 'Parking', 'Pyramid Tours', 'Rooftop Pool', 'Restaurant', 'Bar', 'Pyramid Views', 'Tour Desk', 'Camel Rides'],
                hostId: 6,
                hostName: 'Cairo Heritage Stays',
                maxGuests: 4,
                checkinTime: '3:00 PM',
                checkoutTime: '11:00 AM',
                locationDescription: 'Located just 1km from the Giza Plateau, offering direct views of the Great Pyramids and the Sphinx. The hotel is situated in a quiet area away from the city center, providing a peaceful base for exploring the pyramids. The location offers easy access to the Giza Plateau entrance and sound and light shows.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 18, userId: 19, userName: 'David Brown', rating: 5, comment: 'Amazing views of the pyramids! We could see them from our room and the rooftop pool. The hotel organized a perfect pyramid tour and camel ride. The staff was helpful and the location is unbeatable.', date: '2024-12-12' }
                ]
            },
            // Chobe National Park, Botswana Properties
            {
                id: 17,
                name: 'Chobe Riverfront Camp',
                location: 'Chobe National Park, Botswana',
                price: 340,
                type: 'Tree Camp',
                rating: 4.6,
                image: 'images/delta.jpg',
                description: 'Riverside camp in Chobe National Park with excellent elephant viewing. This camp offers comfortable tented accommodation along the Chobe River, where hundreds of elephants gather daily. Enjoy boat cruises on the river, game drives in the park, and evening campfires under the stars.',
                amenities: ['Wi-Fi', 'Safari Tours', 'Breakfast', 'River Cruises', 'Tented Accommodation', 'River Views', 'Game Drives', 'Evening Campfire', 'Dining Tent'],
                hostId: 2,
                hostName: 'Chobe Wildlife',
                maxGuests: 4,
                checkinTime: '2:00 PM',
                checkoutTime: '10:00 AM',
                locationDescription: 'Situated on the banks of the Chobe River in northern Botswana, this camp offers front-row seats to one of Africa\'s greatest elephant concentrations. The Chobe River attracts thousands of elephants, buffalo, and other wildlife, especially during the dry season. Boat cruises provide unique water-level views of the animals.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 19, userId: 20, userName: 'Lisa Anderson', rating: 5, comment: 'Saw hundreds of elephants! The river cruises were amazing - we saw elephants swimming, hippos, crocodiles, and countless birds. The camp was comfortable and the guides were knowledgeable. Unforgettable experience!', date: '2024-11-28' }
                ]
            },
            // Etosha National Park, Namibia Properties
            {
                id: 18,
                name: 'Etosha Pan Lodge',
                location: 'Etosha National Park, Namibia',
                price: 290,
                type: 'Luxury Lodge',
                rating: 4.5,
                image: 'images/savanna.jpg',
                description: 'Lodge overlooking the Etosha salt pan with excellent wildlife viewing. This comfortable lodge offers spacious rooms with views of the pan, a waterhole viewing area, and a restaurant. The lodge is located near several waterholes, providing excellent opportunities to observe wildlife, especially during the dry season.',
                amenities: ['Wi-Fi', 'Safari Tours', 'Breakfast', 'Waterhole Viewing', 'Restaurant', 'Bar', 'Waterhole Deck', 'Game Drives', 'Swimming Pool'],
                hostId: 2,
                hostName: 'Etosha Safaris',
                maxGuests: 6,
                checkinTime: '3:00 PM',
                checkoutTime: '11:00 AM',
                locationDescription: 'Located on the edge of Etosha National Park, overlooking the vast salt pan. The lodge is strategically positioned near several waterholes, which attract large numbers of animals during the dry season. The pan itself is a unique landscape, and the surrounding area offers excellent game viewing opportunities.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 20, userId: 21, userName: 'James Wilson', rating: 4, comment: 'Great wildlife viewing at the waterhole! We saw lions, elephants, giraffes, and rhinos. The lodge was comfortable and the waterhole viewing deck was perfect for photography. The salt pan views are unique.', date: '2024-12-05' }
                ]
            },
            // Amboseli, Kenya Properties
            {
                id: 19,
                name: 'Amboseli Elephant View Lodge',
                location: 'Amboseli, Kenya',
                price: 370,
                type: 'Luxury Lodge',
                rating: 4.7,
                image: 'images/mountainView.jpg',
                description: 'Lodge with views of Mount Kilimanjaro and excellent elephant viewing. This lodge offers spacious rooms with private balconies facing Africa\'s highest peak. Amboseli is famous for its large elephant herds and stunning Kilimanjaro views. Enjoy game drives, nature walks, and cultural visits to Maasai villages.',
                amenities: ['Wi-Fi', 'Pool', 'Safari Tours', 'Breakfast', 'Mountain View', 'Kilimanjaro Views', 'Restaurant', 'Bar', 'Cultural Tours', 'Nature Walks'],
                hostId: 3,
                hostName: 'Amboseli Stays',
                maxGuests: 4,
                checkinTime: '3:00 PM',
                checkoutTime: '11:00 AM',
                locationDescription: 'Situated in Amboseli National Park with direct views of Mount Kilimanjaro across the border in Tanzania. The park is famous for its large elephant herds, some of the largest in Africa. The location offers clear views of Kilimanjaro, especially at sunrise and sunset. The park\'s swamps attract diverse wildlife including elephants, buffalo, and numerous bird species.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 21, userId: 22, userName: 'Robert Taylor', rating: 5, comment: 'Kilimanjaro views are spectacular! We saw huge elephant herds with the mountain in the background - absolutely stunning. The lodge was comfortable and the staff organized great game drives. A must-visit destination!', date: '2024-12-01' }
                ]
            },
            // Tsavo, Kenya Properties
            {
                id: 20,
                name: 'Tsavo Red Earth Camp',
                location: 'Tsavo, Kenya',
                price: 330,
                type: 'Tree Camp',
                rating: 4.4,
                image: 'images/tree.jpg',
                description: 'Authentic camp in Tsavo National Park with red earth landscapes. This rustic camp offers an authentic safari experience in Kenya\'s largest national park. The red earth gives the landscape a unique appearance, and the park is home to diverse wildlife including elephants, lions, and the rare fringed-eared oryx.',
                amenities: ['Wi-Fi', 'Safari Tours', 'Breakfast', 'Wildlife Viewing', 'Tented Accommodation', 'Campfire', 'Dining Tent', 'Game Drives'],
                hostId: 3,
                hostName: 'Tsavo Adventures',
                maxGuests: 4,
                checkinTime: '2:00 PM',
                checkoutTime: '10:00 AM',
                locationDescription: 'Located in Tsavo East National Park, known for its red earth and diverse wildlife. The camp is situated near water sources, attracting regular wildlife visits. Tsavo is one of Kenya\'s largest parks and offers a more remote safari experience away from crowds. The red earth creates stunning photographic opportunities.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 22, userId: 23, userName: 'Maria Garcia', rating: 4, comment: 'Unique red earth landscape! The camp was comfortable and we saw lots of wildlife including elephants and lions. The red earth makes for beautiful photos. The guides were knowledgeable about the park.', date: '2024-11-25' }
                ]
            },
            // Hwange National Park, Zimbabwe Properties
            {
                id: 21,
                name: 'Hwange Elephant Camp',
                location: 'Hwange National Park, Zimbabwe',
                price: 280,
                type: 'Tree Camp',
                rating: 4.4,
                image: 'images/delta.jpg',
                description: 'Wildlife camp in Hwange National Park with excellent elephant viewing. This comfortable camp offers tented accommodation near waterholes, where large herds of elephants gather. Hwange is Zimbabwe\'s largest national park and home to one of Africa\'s largest elephant populations. Enjoy game drives, walking safaris, and waterhole viewing.',
                amenities: ['Wi-Fi', 'Safari Tours', 'Breakfast', 'Elephant Viewing', 'Tented Accommodation', 'Waterhole Viewing', 'Game Drives', 'Walking Safaris', 'Campfire'],
                hostId: 7,
                hostName: 'Hwange Wildlife',
                maxGuests: 4,
                checkinTime: '2:00 PM',
                checkoutTime: '10:00 AM',
                locationDescription: 'Located in Hwange National Park, Zimbabwe\'s premier wildlife destination. The camp is strategically positioned near natural waterholes, which attract hundreds of elephants, especially during the dry season. The park is home to over 100 mammal species and 400 bird species, making it one of Africa\'s most biodiverse parks.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 23, userId: 24, userName: 'Sarah Johnson', rating: 4, comment: 'Saw so many elephants! The waterhole viewing was incredible - we watched hundreds of elephants drinking and playing. The camp was comfortable and the guides were excellent. Great value for money.', date: '2024-11-22' }
                ]
            },
            // Addis Ababa, Ethiopia Properties
            {
                id: 22,
                name: 'Addis Ababa City Center Apartment',
                location: 'Addis Ababa, Ethiopia',
                price: 85,
                type: 'Apartment',
                rating: 4.6,
                image: 'images/lodge.jpg',
                description: 'Modern apartment in the heart of Addis Ababa, close to museums, restaurants, and cultural sites. This comfortable one-bedroom apartment is perfect for exploring Ethiopia\'s capital city. The apartment features modern amenities, a fully equipped kitchen, and is within walking distance of major attractions including the National Museum and Merkato market.',
                amenities: ['Wi-Fi', 'Kitchen', 'Parking', 'City Center', 'Cultural Tours', 'Washing Machine', 'TV', 'Air Conditioning', 'Near Museums', 'Near Restaurants'],
                hostId: 8,
                hostName: 'Ethiopian Heritage Stays',
                maxGuests: 2,
                checkinTime: '3:00 PM',
                checkoutTime: '11:00 AM',
                locationDescription: 'Located in the heart of Addis Ababa\'s city center, within walking distance of the National Museum (home to Lucy), the Holy Trinity Cathedral, and the vibrant Merkato market. The area is well-connected with public transportation and offers easy access to restaurants serving authentic Ethiopian cuisine. The location provides a perfect base for exploring the city.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 24, userId: 25, userName: 'Michael Chen', rating: 5, comment: 'Perfect location for exploring Addis Ababa! The apartment was clean and comfortable. We walked to the National Museum and tried amazing Ethiopian food nearby. The host was helpful with recommendations.', date: '2024-12-15' }
                ]
            },
            // Lalibela, Ethiopia Properties
            {
                id: 23,
                name: 'Lalibela Rock-Hewn Church View Lodge',
                location: 'Lalibela, Ethiopia',
                price: 150,
                type: 'Luxury Lodge',
                rating: 4.9,
                image: 'images/delta.jpg',
                description: 'Authentic lodge near the famous rock-hewn churches of Lalibela, a UNESCO World Heritage site. This traditional Ethiopian lodge offers comfortable accommodation just minutes from the churches. Experience authentic Ethiopian hospitality, enjoy traditional meals, and explore the incredible 12th-century churches carved from solid rock.',
                amenities: ['Wi-Fi', 'Safari Tours', 'Breakfast', 'Church Tours', 'Cultural Experience', 'Traditional Meals', 'Restaurant', 'Cultural Shows', 'Guided Tours'],
                hostId: 8,
                hostName: 'Lalibela Heritage Tours',
                maxGuests: 4,
                checkinTime: '2:00 PM',
                checkoutTime: '10:00 AM',
                locationDescription: 'Located just 500 meters from the Lalibela rock-hewn churches, one of Ethiopia\'s most important historical sites. The churches are carved entirely from solid rock and represent an incredible feat of engineering. The lodge offers easy access to both the northern and southern church groups, as well as local markets and cultural sites.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 25, userId: 26, userName: 'Emma Williams', rating: 5, comment: 'Incredible experience visiting the churches! The lodge was comfortable and the staff organized perfect church tours. The churches are absolutely amazing - truly a wonder of the world. The traditional meals were delicious.', date: '2024-12-05' }
                ]
            },
            // Kigali, Rwanda Properties
            {
                id: 24,
                name: 'Kigali City Apartment',
                location: 'Kigali, Rwanda',
                price: 95,
                type: 'Apartment',
                rating: 4.5,
                image: 'images/villa.jpg',
                description: 'Modern apartment in Kigali with easy access to city attractions. This clean and comfortable apartment is perfect for business travelers and tourists exploring Rwanda\'s capital. The apartment features modern amenities, a kitchen, and is located in a safe neighborhood with good restaurants and shops nearby.',
                amenities: ['Wi-Fi', 'Kitchen', 'Parking', 'City Center', 'Washing Machine', 'TV', 'Air Conditioning', 'Safe Neighborhood', 'Near Restaurants'],
                hostId: 9,
                hostName: 'Kigali Stays',
                maxGuests: 2,
                checkinTime: '3:00 PM',
                checkoutTime: '11:00 AM',
                locationDescription: 'Located in a safe and convenient area of Kigali, within easy reach of the city center, restaurants, and shops. The apartment is well-positioned for visiting attractions like the Kigali Genocide Memorial, local markets, and cultural centers. The area is known for its cleanliness and safety, reflecting Rwanda\'s reputation as one of Africa\'s cleanest countries.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 26, userId: 27, userName: 'David Brown', rating: 4, comment: 'Clean and comfortable! The apartment was well-maintained and the location was convenient. Kigali is a beautiful and clean city. The host was responsive and helpful.', date: '2024-12-10' }
                ]
            },
            // Volcanoes National Park, Rwanda Properties
            {
                id: 25,
                name: 'Volcanoes Gorilla Lodge',
                location: 'Volcanoes National Park, Rwanda',
                price: 450,
                type: 'Luxury Lodge',
                rating: 4.8,
                image: 'images/mountainView.jpg',
                description: 'Lodge near Volcanoes National Park, perfect for gorilla trekking. This comfortable lodge offers the perfect base for gorilla trekking adventures. The lodge organizes gorilla permits and provides experienced guides. After your trek, relax in the cozy lounge, enjoy delicious meals, and share stories with fellow travelers.',
                amenities: ['Wi-Fi', 'Safari Tours', 'Breakfast', 'Gorilla Trekking', 'Restaurant', 'Bar', 'Cozy Lounge', 'Permit Assistance', 'Experienced Guides', 'Gift Shop'],
                hostId: 9,
                hostName: 'Volcanoes Adventures',
                maxGuests: 4,
                checkinTime: '2:00 PM',
                checkoutTime: '10:00 AM',
                locationDescription: 'Situated near Volcanoes National Park, home to the endangered mountain gorillas. The lodge is located at the base of the Virunga Mountains, providing stunning views of the volcanic peaks. The location offers easy access to gorilla trekking starting points and is surrounded by beautiful mountain scenery.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee. Note: Gorilla permits are non-refundable.',
                available: true,
                reviews: [
                    { id: 27, userId: 28, userName: 'Lisa Anderson', rating: 5, comment: 'Amazing gorilla experience! We spent an hour with a gorilla family - it was emotional and unforgettable. The lodge helped organize everything perfectly. The guides were professional and the experience was worth every penny. Highly recommend!', date: '2024-12-08' }
                ]
            },
            // Diani Beach, Kenya Properties
            {
                id: 26,
                name: 'Diani Beach Resort',
                location: 'Diani Beach, Kenya',
                price: 200,
                type: 'Luxury Lodge',
                rating: 4.7,
                image: 'images/lodge.jpg',
                description: 'Beachfront resort on Diani Beach with stunning ocean views. This tropical paradise offers direct beach access, a swimming pool, and comfortable rooms with ocean views. Diani Beach is known for its white sand, turquoise waters, and excellent water sports. Perfect for relaxation and adventure.',
                amenities: ['Wi-Fi', 'Pool', 'Beach Access', 'Breakfast', 'Water Sports', 'Restaurant', 'Bar', 'Ocean Views', 'Snorkeling', 'Diving', 'Beach Bar'],
                hostId: 3,
                hostName: 'Diani Beach Stays',
                maxGuests: 6,
                checkinTime: '3:00 PM',
                checkoutTime: '11:00 AM',
                locationDescription: 'Located directly on Diani Beach, one of Kenya\'s most beautiful beaches. The resort offers direct access to the pristine white sand beach and turquoise Indian Ocean. The area is known for excellent snorkeling, diving, and water sports. Nearby attractions include Shimba Hills National Reserve and Colobus Conservation.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 28, userId: 29, userName: 'James Wilson', rating: 5, comment: 'Beautiful beach and perfect weather! The resort was comfortable and the beach access was amazing. We enjoyed snorkeling and the water was crystal clear. The staff was friendly and the food was great. Perfect beach getaway!', date: '2024-12-12' }
                ]
            },
            // Zanzibar, Tanzania Properties
            {
                id: 27,
                name: 'Zanzibar Stone Town Apartment',
                location: 'Zanzibar, Tanzania',
                price: 130,
                type: 'Apartment',
                rating: 4.6,
                image: 'images/tree.jpg',
                description: 'Historic apartment in Stone Town, Zanzibar with authentic Swahili architecture. This beautifully restored apartment is located in a historic building in Stone Town, a UNESCO World Heritage Site. Experience the unique blend of Arab, Persian, Indian, and European influences in the architecture and culture.',
                amenities: ['Wi-Fi', 'Kitchen', 'Parking', 'Historic Area', 'Cultural Tours', 'Traditional Architecture', 'Near Beaches', 'Near Markets', 'Air Conditioning'],
                hostId: 1,
                hostName: 'Zanzibar Heritage',
                maxGuests: 4,
                checkinTime: '3:00 PM',
                checkoutTime: '11:00 AM',
                locationDescription: 'Located in the heart of Stone Town, Zanzibar\'s historic center. The apartment is within walking distance of major attractions including the House of Wonders, Forodhani Gardens, and the Old Fort. Stone Town\'s narrow streets are filled with shops, restaurants, and historic buildings, offering an authentic Zanzibar experience.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 29, userId: 30, userName: 'Robert Taylor', rating: 5, comment: 'Authentic Zanzibar experience! The apartment is in a beautiful historic building. We loved exploring Stone Town\'s narrow streets and visiting the spice markets. The location is perfect for experiencing Zanzibar\'s unique culture.', date: '2024-12-05' }
                ]
            },
            // Lamu, Kenya Properties
            {
                id: 28,
                name: 'Lamu Swahili House',
                location: 'Lamu, Kenya',
                price: 110,
                type: 'Luxury Lodge',
                rating: 4.5,
                image: 'images/savanna.jpg',
                description: 'Traditional Swahili house in Lamu Old Town, a UNESCO World Heritage site. This authentic Swahili house features traditional architecture with a central courtyard, carved wooden doors, and rooftop terrace. Experience the unique Swahili culture, enjoy fresh seafood, and explore the historic town on foot or by donkey.',
                amenities: ['Wi-Fi', 'Kitchen', 'Beach Access', 'Cultural Tours', 'Traditional Architecture', 'Rooftop Terrace', 'Central Courtyard', 'Near Beaches', 'Donkey Rides'],
                hostId: 3,
                hostName: 'Lamu Cultural Stays',
                maxGuests: 4,
                checkinTime: '2:00 PM',
                checkoutTime: '10:00 AM',
                locationDescription: 'Located in Lamu Old Town, one of the oldest and best-preserved Swahili settlements in East Africa. The town has no cars - transportation is by foot, donkey, or boat. The house is just steps from the waterfront, where traditional dhows sail, and within walking distance of the Lamu Museum, fort, and beautiful beaches.',
                cancellationPolicy: 'Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.',
                available: true,
                reviews: [
                    { id: 30, userId: 31, userName: 'Maria Garcia', rating: 4, comment: 'Beautiful historic town! The Swahili house was authentic and comfortable. We loved exploring the car-free streets and taking a dhow trip. The culture is unique and the people are friendly. A special place!', date: '2024-11-30' }
                ]
            }
        ];
        await fs.writeFile(PROPERTIES_FILE, JSON.stringify(sampleProperties, null, 2));
    }
    
    // Initialize bookings.json
    try {
        await fs.access(BOOKINGS_FILE);
    } catch {
        await fs.writeFile(BOOKINGS_FILE, JSON.stringify([], null, 2));
    }
}

// Helper functions
async function readData(file) {
    try {
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeData(file, data) {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// ==================== AUTHENTICATION ROUTES ====================

// Register User (Guest/Booker or Host)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role, businessName } = req.body;
        
        // Basic validation
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        // Password validation
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        
        // Host-specific validation
        if (role === 'host' && !businessName) {
            return res.status(400).json({ error: 'Business name is required for host registration' });
        }
        
        const users = await readData(USERS_FILE);
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Determine user role (default to 'booker' if not specified)
        const userRole = role === 'host' ? 'host' : 'booker';
        
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name: userRole === 'host' ? businessName : name,
            contactName: userRole === 'host' ? name : null,
            email,
            password: hashedPassword,
            role: userRole,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        await writeData(USERS_FILE, users);
        
        // Generate token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            message: `${userRole === 'host' ? 'Host' : 'Guest'} account created successfully`,
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login User (Guest/Booker or Host)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const users = await readData(USERS_FILE);
        const user = users.find(u => u.email === email);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Check role if specified (ensure user is logging in with correct role)
        if (role && user.role !== role) {
            const roleName = user.role === 'host' ? 'host' : 'guest';
            return res.status(403).json({ error: `This account is registered as a ${roleName}. Please use the ${roleName} login form.` });
        }
        
        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== PROPERTY ROUTES ====================

// Get all properties
app.get('/api/properties', async (req, res) => {
    try {
        // Decode URL parameters properly
        const location = req.query.location ? decodeURIComponent(req.query.location) : undefined;
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;
        const type = req.query.type;
        const minRating = req.query.minRating;
        
        let properties = await readData(PROPERTIES_FILE);
        
        // Debug logging (can be removed in production)
        if (location) {
            console.log(`\n=== SEARCH REQUEST ===`);
            console.log(`Raw location parameter: "${req.query.location}"`);
            console.log(`Decoded location: "${location}"`);
            const uniqueLocations = [...new Set(properties.map(p => p.location))];
            console.log(`Total properties in database: ${properties.length}`);
            console.log(`Unique locations available: ${uniqueLocations.length}`);
            
            // Test matching before filtering
            const testMatch = properties.filter(p => {
                if (!p.location) return false;
                const propLocation = p.location.toLowerCase().trim().replace(/\s+/g, ' ');
                const searchLocation = location.toLowerCase().trim().replace(/\s+/g, ' ');
                return propLocation === searchLocation;
            });
            console.log(`Exact matches found: ${testMatch.length}`);
            if (testMatch.length > 0) {
                testMatch.forEach(p => console.log(`  - ${p.name} (ID: ${p.id})`));
            }
        }
        
        // Filter out unavailable properties first (only exclude if explicitly false)
        const beforeAvailabilityFilter = properties.length;
        properties = properties.filter(p => p.available !== false);
        if (location) {
            console.log(`After availability filter: ${properties.length} properties (removed ${beforeAvailabilityFilter - properties.length})`);
        }
        
        // Apply filters
        if (location) {
            // Normalize location for matching (lowercase, trim, normalize whitespace)
            const searchLocation = location.toLowerCase().trim().replace(/\s+/g, ' ');
            console.log(`Applying location filter with normalized search: "${searchLocation}"`);
            const beforeLocationFilter = properties.length;
            properties = properties.filter(p => {
                if (!p.location) {
                    console.log(`  ✗ Property ${p.id} has no location`);
                    return false;
                }
                
                const propLocation = p.location.toLowerCase().trim().replace(/\s+/g, ' ');
                
                // Exact match (highest priority) - handles full location searches like "Kruger National Park, South Africa"
                if (propLocation === searchLocation) {
                    console.log(`  ✓ Property ${p.id} "${p.name}" - EXACT MATCH: "${propLocation}" === "${searchLocation}"`);
                    return true;
                }
                
                // If search includes comma (full location), try exact match and flexible matching
                if (searchLocation.includes(',')) {
                    // Extract location name and country from search
                    const parts = searchLocation.split(',');
                    const searchName = parts[0].trim();
                    const searchCountry = parts.length > 1 ? parts[1].trim() : '';
                    
                    const propParts = propLocation.split(',');
                    const propName = propParts[0].trim();
                    const propCountry = propParts.length > 1 ? propParts[1].trim() : '';
                    
                    // Match if both location name and country match exactly
                    if (searchName === propName && searchCountry === propCountry) {
                        console.log(`  ✓ Property ${p.id} "${p.name}" - NAME+COUNTRY MATCH: "${searchName}" + "${searchCountry}"`);
                        return true;
                    }
                    
                    // Match if location name matches exactly (handles variations in country name formatting)
                    if (searchName === propName) {
                        console.log(`  ✓ Property ${p.id} "${p.name}" - NAME MATCH: "${searchName}"`);
                        return true;
                    }
                    
                    // Match if property location contains the full search string
                    if (propLocation.includes(searchLocation)) {
                        console.log(`  ✓ Property ${p.id} "${p.name}" - CONTAINS MATCH: "${propLocation}" contains "${searchLocation}"`);
                        return true;
                    }
                    
                    console.log(`  ✗ Property ${p.id} "${p.name}" - NO MATCH: prop="${propLocation}" vs search="${searchLocation}"`);
                    return false;
                }
                
                // For partial searches without comma (e.g., "Kruger"), match properties that start with search term followed by comma or space
                // This ensures "Kruger" matches "Kruger National Park, South Africa" 
                // but NOT other locations that contain "Kruger" as a substring
                if (propLocation.startsWith(searchLocation + ',')) {
                    console.log(`  ✓ Property ${p.id} "${p.name}" - STARTS WITH MATCH: "${propLocation}" starts with "${searchLocation},"`);
                    return true;
                }
                
                // Also check if the location name starts with the search term
                const propName = propLocation.split(',')[0].trim();
                if (propName.startsWith(searchLocation)) {
                    console.log(`  ✓ Property ${p.id} "${p.name}" - NAME STARTS WITH MATCH: "${propName}" starts with "${searchLocation}"`);
                    return true;
                }
                
                console.log(`  ✗ Property ${p.id} "${p.name}" - NO MATCH: prop="${propLocation}" vs search="${searchLocation}"`);
                return false;
            });
            console.log(`After location filter: ${properties.length} properties (removed ${beforeLocationFilter - properties.length})`);
        }
        if (minPrice) {
            properties = properties.filter(p => p.price >= parseInt(minPrice));
        }
        if (maxPrice) {
            properties = properties.filter(p => p.price <= parseInt(maxPrice));
        }
        if (type && type !== 'All Types') {
            properties = properties.filter(p => p.type === type);
        }
        if (minRating) {
            properties = properties.filter(p => p.rating >= parseFloat(minRating));
        }
        
        // Final debug logging
        if (location) {
            console.log(`Final result: ${properties.length} properties found`);
            if (properties.length > 0) {
                properties.forEach(p => console.log(`  ✓ ${p.name} - ${p.location}`));
            } else {
                console.log(`  ✗ No properties found for "${location}"`);
            }
            console.log(`=== END SEARCH ===\n`);
        }
        
        res.json(properties);
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single property
app.get('/api/properties/:id', async (req, res) => {
    try {
        const properties = await readData(PROPERTIES_FILE);
        const property = properties.find(p => p.id === parseInt(req.params.id));
        
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        res.json(property);
    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create property (Host only)
app.post('/api/properties', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'host') {
            return res.status(403).json({ error: 'Only hosts can create properties' });
        }
        
        const properties = await readData(PROPERTIES_FILE);
        const newProperty = {
            id: properties.length > 0 ? Math.max(...properties.map(p => p.id)) + 1 : 1,
            ...req.body,
            hostId: req.user.id,
            available: true,
            rating: 0
        };
        
        properties.push(newProperty);
        await writeData(PROPERTIES_FILE, properties);
        
        res.status(201).json(newProperty);
    } catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update property (Host only)
app.put('/api/properties/:id', authenticateToken, async (req, res) => {
    try {
        const properties = await readData(PROPERTIES_FILE);
        const index = properties.findIndex(p => p.id === parseInt(req.params.id));
        
        if (index === -1) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        if (properties[index].hostId !== req.user.id && req.user.role !== 'host') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        properties[index] = { ...properties[index], ...req.body };
        await writeData(PROPERTIES_FILE, properties);
        
        res.json(properties[index]);
    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete property (Host only)
app.delete('/api/properties/:id', authenticateToken, async (req, res) => {
    try {
        const properties = await readData(PROPERTIES_FILE);
        const index = properties.findIndex(p => p.id === parseInt(req.params.id));
        
        if (index === -1) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        if (properties[index].hostId !== req.user.id && req.user.role !== 'host') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        properties.splice(index, 1);
        await writeData(PROPERTIES_FILE, properties);
        
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== BOOKING ROUTES ====================

// Get bookings (for user or host)
app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const bookings = await readData(BOOKINGS_FILE);
        let userBookings;
        
        if (req.user.role === 'host') {
            // Get bookings for host's properties
            const properties = await readData(PROPERTIES_FILE);
            const hostPropertyIds = properties
                .filter(p => p.hostId === req.user.id)
                .map(p => p.id);
            userBookings = bookings.filter(b => hostPropertyIds.includes(b.propertyId));
        } else {
            // Get bookings for booker
            userBookings = bookings.filter(b => b.userId === req.user.id);
        }
        
        // Populate property details
        const properties = await readData(PROPERTIES_FILE);
        const bookingsWithDetails = userBookings.map(booking => {
            const property = properties.find(p => p.id === booking.propertyId);
            return { ...booking, property };
        });
        
        res.json(bookingsWithDetails);
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'booker') {
            return res.status(403).json({ error: 'Only bookers can make bookings' });
        }
        
        const { propertyId, checkIn, checkOut, guests } = req.body;
        
        if (!propertyId || !checkIn || !checkOut || !guests) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const properties = await readData(PROPERTIES_FILE);
        const property = properties.find(p => p.id === parseInt(propertyId));
        
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        // Calculate total
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const subtotal = nights * property.price;
        const serviceFee = Math.round(subtotal * 0.12);
        const total = subtotal + serviceFee;
        
        const bookings = await readData(BOOKINGS_FILE);
        const newBooking = {
            id: bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1,
            userId: req.user.id,
            propertyId: parseInt(propertyId),
            checkIn,
            checkOut,
            guests: parseInt(guests),
            nights,
            subtotal,
            serviceFee,
            total,
            status: 'Confirmed',
            createdAt: new Date().toISOString()
        };
        
        bookings.push(newBooking);
        await writeData(BOOKINGS_FILE, bookings);
        
        res.status(201).json({ ...newBooking, property });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a booking (Booker only)
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'booker') {
            return res.status(403).json({ error: 'Only bookers can cancel bookings' });
        }

        const bookingId = parseInt(req.params.id);
        const bookings = await readData(BOOKINGS_FILE);
        
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);

        if (bookingIndex === -1) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Ensure the user owns this booking
        if (bookings[bookingIndex].userId !== req.user.id) {
            return res.status(403).json({ error: 'You are not authorized to cancel this booking' });
        }

        // Remove the booking
        bookings.splice(bookingIndex, 1);
        await writeData(BOOKINGS_FILE, bookings);

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== USER ROUTES ====================

// Get all users (for host names)
app.get('/api/users', async (req, res) => {
    try {
        const users = await readData(USERS_FILE);
        // Return only public user info (no passwords)
        const publicUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }));
        res.json(publicUsers);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== REVIEW ROUTES ====================

// Get reviews for a property
app.get('/api/properties/:id/reviews', async (req, res) => {
    try {
        const properties = await readData(PROPERTIES_FILE);
        const property = properties.find(p => p.id === parseInt(req.params.id));
        
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        res.json(property.reviews || []);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add review to a property (Booker only)
app.post('/api/properties/:id/reviews', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'booker') {
            return res.status(403).json({ error: 'Only bookers can add reviews' });
        }
        
        const { rating, comment } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        
        const properties = await readData(PROPERTIES_FILE);
        const index = properties.findIndex(p => p.id === parseInt(req.params.id));
        
        if (index === -1) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        const users = await readData(USERS_FILE);
        const user = users.find(u => u.id === req.user.id);
        
        const newReview = {
            id: properties[index].reviews ? Math.max(...properties[index].reviews.map(r => r.id), 0) + 1 : 1,
            userId: req.user.id,
            userName: user?.name || 'Anonymous',
            rating: parseInt(rating),
            comment: comment || '',
            date: new Date().toISOString().split('T')[0]
        };
        
        if (!properties[index].reviews) {
            properties[index].reviews = [];
        }
        
        properties[index].reviews.push(newReview);
        
        // Recalculate average rating
        const totalRating = properties[index].reviews.reduce((sum, r) => sum + r.rating, 0);
        properties[index].rating = totalRating / properties[index].reviews.length;
        
        await writeData(PROPERTIES_FILE, properties);
        
        res.status(201).json(newReview);
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== HOST DASHBOARD ROUTES ====================

// Get host dashboard stats
app.get('/api/host/stats', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'host') {
            return res.status(403).json({ error: 'Only hosts can access dashboard stats' });
        }
        
        const properties = await readData(PROPERTIES_FILE);
        const bookings = await readData(BOOKINGS_FILE);
        
        const hostProperties = properties.filter(p => p.hostId === req.user.id);
        const hostPropertyIds = hostProperties.map(p => p.id);
        const hostBookings = bookings.filter(b => hostPropertyIds.includes(b.propertyId));
        
        const totalEarnings = hostBookings.reduce((sum, b) => sum + b.total, 0);
        const totalBookings = hostBookings.length;
        const averageRating = hostProperties.length > 0
            ? hostProperties.reduce((sum, p) => sum + p.rating, 0) / hostProperties.length
            : 0;
        
        // Calculate occupancy rate (simplified)
        const occupancyRate = totalBookings > 0 ? Math.min(100, (totalBookings / 10) * 100) : 0;
        
        res.json({
            totalEarnings,
            totalBookings,
            occupancyRate: Math.round(occupancyRate),
            averageRating: Math.round(averageRating * 10) / 10,
            totalProperties: hostProperties.length
        });
    } catch (error) {
        console.error('Get host stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
async function startServer() {
    await initializeData();
    app.listen(PORT, () => {
        console.log(`🚀 Safari Stays API server running on http://localhost:${PORT}`);
        console.log(`📁 Data directory: ${DATA_DIR}`);
    });
}

startServer().catch(console.error);

