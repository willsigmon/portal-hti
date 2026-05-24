import { Award, Camera, Music, Sparkles, Users, Volume2 } from "lucide-react";

export const CONTACT = {
  email: "portalheadquarters@gmail.com",
  addressLine: "3801 Hillsborough St #113",
  city: "Raleigh, NC 27607",
  googleMaps: "https://www.google.com/maps/dir/?api=1&destination=3801+Hillsborough+St+%23113+Raleigh+NC+27607",
  instagram: "https://instagram.com/theportalhq",
  tourUrl: "https://theportalhq.com/tour.html",
};

export const VENUE_STATS = [
  { value: "5,000", label: "Sq Ft" },
  { value: "200", label: "Max Guests" },
  { value: "250+", label: "Events Hosted" },
  { value: "Free", label: "Parking" },
];

export const PHOTOS = {
  hero: "/venue/venue-daylight-floor.jpg",
  heroAlt: "Daylight filling the Portal HQ event floor in Raleigh",
  performance: "/venue/venue-live-performance.jpg",
  stage: "/venue/venue-production-stage.jpg",
  dining: "/venue/venue-dining-celebration.jpg",
  exterior: "/venue/venue-exterior-patio.jpg",
  entry: "/venue/venue-wood-entry.jpg",
  lounge: "/venue/venue-lounge-corner.jpg",
  food: "/venue/venue-food-spread.jpg",
};

export const GALLERY_IMAGES = [
  {
    src: "/venue/venue-daylight-floor.jpg",
    alt: "Bright open Portal HQ event floor",
    category: "general",
    description: "Open industrial gallery floor with clean concrete, high ceilings, and daytime light.",
  },
  {
    src: "/venue/venue-main-hall-daylight.jpg",
    alt: "Main Hall Perspective",
    category: "general",
    description: "The core room in its flexible blank-canvas state for workshops, showcases, and receptions.",
  },
  {
    src: "/venue/venue-executive-card.jpg",
    alt: "Corporate seminar and projection configuration",
    category: "corporate",
    description: "Projection-forward layout for seminars, retreats, talks, and leadership offsites.",
  },
  {
    src: "/venue/venue-production-stage.jpg",
    alt: "High-production stage lighting setup",
    category: "showcase",
    description: "Concert-grade stage, lighting, projector, and sound setup for public-facing productions.",
  },
  {
    src: "/venue/venue-dining-celebration.jpg",
    alt: "Warm dining and celebration setup",
    category: "celebration",
    description: "Warm evening layout for dinners, receptions, birthdays, and welcome-party energy.",
  },
  {
    src: "/venue/venue-wood-entry.jpg",
    alt: "Portal HQ wood-accented entry",
    category: "general",
    description: "A polished guest arrival moment with wood accents, art, and direct venue visibility.",
  },
  {
    src: "/venue/venue-exterior-patio.jpg",
    alt: "Portal HQ exterior and patio entry",
    category: "general",
    description: "Accessible Hillsborough Street arrival with outdoor patio flow and free on-site parking.",
  },
  {
    src: "/venue/venue-food-spread.jpg",
    alt: "Catered buffet spread inside Portal HQ",
    category: "celebration",
    description: "Flexible outside-catering friendly setup with easy service zones and guest circulation.",
  },
];

export const BENTO_PHOTOS = [
  { src: "/venue/venue-exterior-patio.jpg", alt: "Portal HQ exterior entry", className: "md:col-span-2 md:row-span-2" },
  { src: "/venue/venue-stage-wide.jpg", alt: "Wide stage projection setup", className: "" },
  { src: "/venue/venue-table-detail.jpg", alt: "Warm table detail", className: "" },
  { src: "/venue/venue-projection-wall.jpg", alt: "Custom projection wall", className: "md:col-span-2" },
  { src: "/venue/venue-lounge-corner.jpg", alt: "Venue lounge corner", className: "" },
  { src: "/venue/venue-candle-tables.jpg", alt: "Candlelit table arrangement", className: "" },
];

export const REVIEWS = [
  {
    author: "Autumn Self",
    role: "Multiple Events",
    text: "The Portal HQ is perfect for anything you need. The staff is friendly, professional, and always ready to assist. A true hidden gem venue in Raleigh.",
    rating: 5,
  },
  {
    author: "Lisa M.",
    role: "Welcome Party",
    text: "The space I first saw was beyond breathtaking once transformed. Everyone raved about the splendor of the evening.",
    rating: 5,
  },
  {
    author: "Robin Darone",
    role: "Christmas Party",
    text: "Had a great Christmas party there. Food was good and so was the atmosphere and decor.",
    rating: 5,
  },
  {
    author: "Ian Meglaughlin",
    role: "Live Event",
    text: "You will not regret coming to The Portal. Ask anyone around and they'll have a story to tell about the energy and experience of this place.",
    rating: 5,
  },
  {
    author: "Angie White",
    role: "Private Event",
    text: "Amazing vibe. Great people. Nice space.",
    rating: 5,
  },
];

export const TECH_EQUIPMENT = {
  audio: [
    { name: "JBL EON715 Powered PA Speaker Mains", qty: 2 },
    { name: "JBL EON712 1300W Powered Stage Wedges", qty: 3 },
    { name: "Electro-Voice ELX200-18SP Powered Subwoofers", qty: 2 },
    { name: "Behringer WING 48-Channel Digital Mixer", qty: 1 },
    { name: "Behringer S32 32x16 Digital Stage Box", qty: 1 },
    { name: "Shure SM58 & SM57 Professional Cardioid Mics", qty: 11 },
    { name: "Shure BLX288/SM58 Wireless Dual Handhelds", qty: 2 },
  ],
  lighting: [
    { name: "Sony VPL-FHZ80 6000-Lumen Laser Projectors", qty: 4 },
    { name: "150W LED Moving Head Gobo Beams", qty: 12 },
    { name: "Rockville RockPAR50 LED RGB Wash Lights", qty: 8 },
    { name: "380W LED Zoom Moving Head Spotlight", qty: 1 },
    { name: "Venue Tetra Bar RGBA Linear Strip Wash Lights", qty: 2 },
    { name: "Rockville ROCKHAZE 700 CFM DMX Haze Machine", qty: 1 },
    { name: "Professional Rotating Mirror Disco Ball", qty: 1 },
  ],
  facilities: [
    { name: "Private backstage VIP dressing room and couch lounge", qty: 1 },
    { name: "In-house beer and wine bar service area", qty: 1 },
    { name: "Modular wood stage setup with backline access", qty: 1 },
    { name: "High-speed Wi-Fi for hybrid events and streaming", qty: 1 },
    { name: "Outdoor accessible guest patio deck", qty: 1 },
    { name: "Free on-site parking spaces", qty: 150 },
  ],
};

export const EVENT_TYPES = [
  {
    id: "corporate",
    href: "/corporate",
    eyebrow: "Corporate & Teams",
    title: "Corporate Retreats & Seminars",
    shortTitle: "Corporate",
    icon: Users,
    photo: "/venue/venue-executive-card.jpg",
    alt: "Corporate projection configuration at Portal HQ",
    summary: "Turn the room into a polished workshop, seminar, offsite, or product-launch venue with projection, sound, parking, and staff support already in-house.",
    inclusions: [
      "Full-wall projection and presentation layout",
      "Wireless microphones and room-wide audio",
      "Flexible seating for talks, trainings, or breakout flow",
      "Free on-site parking for attendees",
      "Optional tech support during event hours",
    ],
    seoTitle: "Corporate Event Venue in Raleigh, NC",
    cta: "Plan a corporate event",
  },
  {
    id: "showcase",
    href: "/concerts",
    eyebrow: "Live Production",
    title: "Concerts, Showcases & Performances",
    shortTitle: "Concerts",
    icon: Music,
    photo: "/venue/venue-production-stage.jpg",
    alt: "Portal HQ stage lighting and projection wall",
    summary: "A mid-sized Raleigh performance room with concert lighting, Behringer digital mixing, projectors, stage flow, and a backstage lounge.",
    inclusions: [
      "Behringer WING digital console and stage box",
      "Moving-head beams, wash lights, haze, and projections",
      "Backstage VIP lounge and artist holding area",
      "Box-office friendly entry and check-in flow",
      "Flexible stage and audience configurations",
    ],
    seoTitle: "Concert Venue and Showcase Space in Raleigh, NC",
    cta: "Build a show layout",
  },
  {
    id: "celebration",
    href: "/celebrations",
    eyebrow: "Private Gatherings",
    title: "Receptions, Birthdays & Welcome Parties",
    shortTitle: "Celebrations",
    icon: Sparkles,
    photo: "/venue/venue-dining-celebration.jpg",
    alt: "Warm reception table layout at Portal HQ",
    summary: "A warm, transformable backdrop for private dinners, receptions, milestone parties, and dance-floor-forward social events.",
    inclusions: [
      "Tables, chairs, and dressed layouts for intimate dinners",
      "Outside-catering friendly service flow",
      "Bar service area for beer, wine, or licensed full-bar partner",
      "Custom projection, music, and party lighting",
      "Outdoor patio and easy guest arrival",
    ],
    seoTitle: "Private Event and Reception Venue in Raleigh, NC",
    cta: "Shape a celebration",
  },
];

export const FAQS = [
  {
    q: "Is the venue accessible?",
    a: "Yes. Portal HQ is planned around an accessible guest experience, and virtually all customer-facing areas in the venue are accessible. If your group has specific mobility or layout needs, include them in the proposal request so Jake's team can plan the room correctly.",
  },
  {
    q: "Do you have a full liquor license?",
    a: "Portal HQ carries a beer and wine license in-house. For full-bar service, planners can bring a licensed external bar partner for more control over selection and cost.",
  },
  {
    q: "What's included with every booking?",
    a: "Every custom proposal starts with exclusive use of the flexible 5,000 sq ft venue, on-site support, free parking, outdoor patio access, and layout planning. AV, stage, lighting, and staffing are scoped to the event.",
  },
  {
    q: "Can we bring outside catering?",
    a: "Yes. The space is outside-catering friendly, and the team can also suggest local partners when you want help shaping the service flow.",
  },
  {
    q: "Is parking really free?",
    a: "Yes. The venue offers free on-site parking, which is one of its strongest advantages for Hillsborough Street events.",
  },
  {
    q: "How far in advance should we secure a date?",
    a: "Two to four weeks is a healthy minimum for many events. Prime weekends, evenings, and holiday windows should be reserved earlier.",
  },
  {
    q: "Can I see the space before committing?",
    a: "Yes. The site now pushes visitors toward a free tour and custom proposal rather than forcing them into a fixed package before seeing the room.",
  },
];

export const PLAN_STEPS = [
  { title: "Walk the room", text: "Start with the 360° tour or schedule a free in-person walkthrough." },
  { title: "Shape the layout", text: "Choose the room flow, stage needs, AV, catering, and guest count." },
  { title: "Get a custom proposal", text: "Jake's team scopes the right configuration without publishing rigid package pricing." },
];

export const LOCAL_BUSINESS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "EventVenue",
  name: "The Portal HQ",
  url: "https://theportalhq.com",
  description: "5,000 sq ft multi-use event venue in Raleigh, NC for corporate retreats, private events, concerts, showcases, and celebrations.",
  email: CONTACT.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "3801 Hillsborough St #113",
    addressLocality: "Raleigh",
    addressRegion: "NC",
    postalCode: "27607",
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: 35.78684, longitude: -78.70844 },
  maximumAttendeeCapacity: 200,
  floorSize: { "@type": "QuantitativeValue", value: 5000, unitCode: "FTK" },
  amenityFeature: ["Accessible Guest Areas", "Plentiful On-Site Parking", "Free Parking", "Stage", "Sound System", "Lighting System", "Projectors", "Bar Service", "AV Support"].map((name) => ({
    "@type": "LocationFeatureSpecification",
    name,
    value: true,
  })),
  sameAs: [
    "https://www.instagram.com/theportalhq",
    "https://www.yelp.com/biz/the-portal-hq-raleigh",
    "https://www.peerspace.com/pages/listings/6823734471ad90bf3ec71a40",
    "https://www.tagvenue.com/us/venues/raleigh/63920/the-portal-hq",
  ],
};

export const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export const FEATURE_CARDS = [
  { icon: Volume2, title: "Sound that already lives here", text: "PA, subs, stage wedges, mics, digital mixing, and tech-friendly signal flow are in-house." },
  { icon: Camera, title: "Full-wall projection and light", text: "Sony laser projectors, moving heads, haze, and wall-mapping make the room feel custom." },
  { icon: Award, title: "A room with production memory", text: "The same footprint can host a seminar at 3 PM and feel like a small concert hall by 8 PM." },
];
