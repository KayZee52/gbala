/**
 * @file This file contains mock data for the Gbala project.
 * In a real application, this data would be fetched from a database or API.
 */

// Mock data for waste types
export const wasteTypes: string[] = [
    "Plastic",
    "Organic",
    "Paper",
    "Glass",
    "Metal",
    "E-waste",
    "Hazardous",
    "Other"
];

// Mock data for waste reports
export const mockWasteReports = [
    {
        id: 1,
        type: "Plastic",
        description: "Large pile of plastic bottles and bags.",
        location: { lat: 6.3104, lng: -10.8042 },
        locationName: "Broad Street, Monrovia",
        photo: "/placeholder.png",
    },
    {
        id: 2,
        type: "Organic",
        description: "Rotting food waste mixed with yard trimmings.",
        location: { lat: 6.3150, lng: -10.7990 },
        locationName: "Paynesville Market, Monrovia",
        photo: "/placeholder.png",
    },
    {
        id: 3,
        type: "Hazardous",
        description: "Broken car batteries leaking acid.",
        location: { lat: 6.2981, lng: -10.7852 },
        locationName: "Near SKD Stadium, Monrovia",
        photo: "/placeholder.png",
    },
    {
        id: 4,
        type: "E-waste",
        description: "Old computer monitors and keyboards.",
        location: { lat: 6.3300, lng: -10.8100 },
        locationName: "Gardnersville, Monrovia",
        photo: "/placeholder.png",
    },
];

// Mock data for flood zones
export const mockFloodZones = [
    {
        id: 1,
        name: "Clara Town Flood Plain",
        riskLevel: "High",
        polygon: [
            { lat: 6.335, lng: -10.800 },
            { lat: 6.330, lng: -10.795 },
            { lat: 6.325, lng: -10.805 },
            { lat: 6.330, lng: -10.810 },
        ],
    },
    {
        id: 2,
        name: "Central Monrovia Drainage Area",
        riskLevel: "Medium",
        polygon: [
            { lat: 6.312, lng: -10.805 },
            { lat: 6.310, lng: -10.800 },
            { lat: 6.308, lng: -10.802 },
            { lat: 6.310, lng: -10.807 },
        ],
    },
];

// Mock data for dump sites
export const mockDumpSites = [
    {
        id: 1,
        name: "Paynesville Transfer Station",
        address: "Red Light, Paynesville, Monrovia",
        location: { lat: 6.288, lng: -10.748 },
        acceptedWaste: ["Plastic", "Organic", "Paper", "Glass", "Metal", "Other"],
        phone: "+231 77 712 3456",
    },
    {
        id: 2,
        name: "Whein Town Landfill",
        address: "Whein Town, Paynesville, Monrovia",
        location: { lat: 6.345, lng: -10.755 },
        acceptedWaste: ["Plastic", "Organic", "Paper", "Glass", "Metal", "Other"],
        phone: "+231 88 612 3456",
    },
    {
        id: 3,
        name: "Monrovia City Corporation (MCC) Recycling Center",
        address: "UN Drive, Monrovia",
        location: { lat: 6.320, lng: -10.808 },
        acceptedWaste: ["Plastic", "Glass", "Metal", "E-waste"],
        phone: "+231 55 512 3456",
    },
];