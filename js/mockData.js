/* ==========================================
   TravelGo - Central Mock Database
   ========================================== */

const TRAVELGO_DB = {
  // 1. Available Bus Routes & Operator Data
  buses: [
    {
      id: "BUS-101",
      name: "IntrCity SmartBus",
      type: "AC Sleeper (2+1)",
      category: "ac",
      from: "Mumbai",
      to: "Goa",
      departureTime: "21:00",
      arrivalTime: "07:30",
      duration: "10h 30m",
      price: 1200,
      rating: 4.8,
      totalSeats: 30,
      amenities: ["WiFi", "Charging Point", "Blanket", "Water Bottle"],
      boardingPoints: ["Bandra East - 20:30", "Sion Circle - 20:50", "Vashi - 21:30"],
      droppingPoints: ["Mapusa - 06:45", "Panjim - 07:15", "Madgaon - 08:00"],
      // Seat Map Structure
      seats: [
        // Lower Deck / Sleeper
        { id: "L1", type: "sleeper", deck: "lower", price: 1200, status: "available", gender: null },
        { id: "L2", type: "sleeper", deck: "lower", price: 1200, status: "booked", gender: "male" },
        { id: "L3", type: "sleeper", deck: "lower", price: 1200, status: "booked", gender: "female" },
        { id: "L4", type: "sleeper", deck: "lower", price: 1200, status: "available", gender: null },
        { id: "L5", type: "sleeper", deck: "lower", price: 1200, status: "available", gender: null },
        { id: "L6", type: "sleeper", deck: "lower", price: 1200, status: "booked", gender: "male" },
        
        // Upper Deck / Sleeper
        { id: "U1", type: "sleeper", deck: "upper", price: 1350, status: "available", gender: null },
        { id: "U2", type: "sleeper", deck: "upper", price: 1350, status: "available", gender: null },
        { id: "U3", type: "sleeper", deck: "upper", price: 1350, status: "booked", gender: "female" },
        { id: "U4", type: "sleeper", deck: "upper", price: 1350, status: "available", gender: null }
      ]
    },
    {
      id: "BUS-102",
      name: "Zingbus Express",
      type: "Non-AC Seater (2+2)",
      category: "seater",
      from: "Mumbai",
      to: "Goa",
      departureTime: "22:15",
      arrivalTime: "09:00",
      duration: "10h 45m",
      price: 850,
      rating: 4.3,
      totalSeats: 36,
      amenities: ["Charging Point", "Reading Light"],
      boardingPoints: ["Borivali West - 21:30", "Andheri East - 22:00"],
      droppingPoints: ["Panjim - 08:30", "Madgaon - 09:15"],
      seats: [
        { id: "S1", type: "seater", deck: "lower", price: 850, status: "available", gender: null },
        { id: "S2", type: "seater", deck: "lower", price: 850, status: "booked", gender: "male" },
        { id: "S3", type: "seater", deck: "lower", price: 850, status: "available", gender: null },
        { id: "S4", type: "seater", deck: "lower", price: 850, status: "available", gender: null }
      ]
    },
    {
      id: "BUS-201",
      name: "Himalayan Travels",
      type: "AC Sleeper (2+1)",
      category: "ac",
      from: "Delhi",
      to: "Manali",
      departureTime: "18:30",
      arrivalTime: "08:00",
      duration: "13h 30m",
      price: 1800,
      rating: 4.7,
      totalSeats: 30,
      amenities: ["WiFi", "Blanket", "Personal TV", "Charging Point"],
      boardingPoints: ["Kashmere Gate - 18:00", "Majnu Ka Tilla - 18:30"],
      droppingPoints: ["Private Bus Stand Manali - 08:00"],
      seats: [
        { id: "DL1", type: "sleeper", deck: "lower", price: 1800, status: "available", gender: null },
        { id: "DL2", type: "sleeper", deck: "lower", price: 1800, status: "available", gender: null }
      ]
    }
  ],

  // 2. Active Special Promo Offers
  offers: [
    { code: "FIRST50", discount: 200, title: "FLAT ₹200 OFF", desc: "Valid on first bus booking" },
    { code: "TRAVELGO", discount: 150, title: "NEW USER", desc: "Get ₹150 instant discount" }
  ]
};

// LocalStorage Initialization System
function initMockData() {
  if (!localStorage.getItem("travelgo_buses")) {
    localStorage.setItem("travelgo_buses", JSON.stringify(TRAVELGO_DB.buses));
  }
  if (!localStorage.getItem("travelgo_offers")) {
    localStorage.setItem("travelgo_offers", JSON.stringify(TRAVELGO_DB.offers));
  }
}

// Global Getter Function for Active Bus List
function getStoredBuses() {
  initMockData();
  const data = localStorage.getItem("travelgo_buses");
  return data ? JSON.parse(data) : TRAVELGO_DB.buses;
}

// Auto Initialize Data
initMockData();