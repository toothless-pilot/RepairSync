import { LineItem } from "@repair-sync/types";

// 2011-2013 Hyundai Elantra (MD/UD) — Front Bumper Damage Assessment
// VIN prefix: 5NPDH4AE
// OEM bumper cover: 86511-3X000 (primer, no fog lamp holes)
// Superseded by: 86511-3X000 (current as of 2024)

export function generateMockLineItems(): LineItem[] {
  return [
    // ── PARTS ────────────────────────────────────────────────────────────────
    {
      id: "li-1",
      description: "Front Bumper Cover — Primed, w/o Fog Lamp Holes",
      category: "parts",
      oemPartNumber: "86511-3X000",
      aiPrice: 93.79,   // CAPA certified aftermarket, best total landed
      sources: [
        {
          tier: "oem",
          vendor: "HyundaiPartsDeal",
          partNumber: "86511-3X000",
          price: 246.50,
          shipping: 0,
          coreCharge: 0,
          totalLanded: 246.50,
          inStock: true,
          url: "https://www.hyundaipartsdeal.com/genuine/hyundai-cover-assembly-fr-bumper~86511-3x000.html",
        },
        {
          tier: "aftermarket",
          vendor: "RockAuto",
          partNumber: "GMP-2400",         // Replace Bumper brand (CAPA)
          price: 85.79,
          shipping: 8.00,
          coreCharge: 0,
          totalLanded: 93.79,
          inStock: true,
          url: "https://www.rockauto.com/en/catalog/hyundai,2012,elantra,1.8l+l4,1481506,body,bumper+cover,2764",
        },
        {
          tier: "salvage",
          vendor: "Car-Part.com",
          partNumber: "86511-3X000 (used)",
          price: 45.00,
          shipping: 35.00,
          coreCharge: 0,
          totalLanded: 80.00,
          inStock: true,
          url: "https://www.car-part.com/cgi-bin/search.cgi?searchtype=1&query=front+bumper+cover&year=2012&make=HYUNDAI&model=ELANTRA",
        },
      ],
    },
    {
      id: "li-2",
      description: "Front Bumper Retainer (Upper Grille Mounting)",
      category: "parts",
      oemPartNumber: "86591-3X000",
      aiPrice: 18.49,
      sources: [
        {
          tier: "oem",
          vendor: "HyundaiPartsDeal",
          partNumber: "86591-3X000",
          price: 28.40,
          shipping: 0,
          coreCharge: 0,
          totalLanded: 28.40,
          inStock: true,
          url: "https://www.hyundaipartsdeal.com/genuine/hyundai-bracket-bumper-mounting~86591-3x000.html",
        },
        {
          tier: "aftermarket",
          vendor: "RockAuto",
          partNumber: "HELP-37892",
          price: 12.99,
          shipping: 5.50,
          coreCharge: 0,
          totalLanded: 18.49,
          inStock: true,
          url: "https://www.rockauto.com/en/catalog/hyundai,2012,elantra,1.8l+l4,1481506,body,bumper+mounting+hardware,2764",
        },
      ],
    },
    {
      id: "li-3",
      description: "Front Bumper Energy Absorber (Foam Backing)",
      category: "parts",
      oemPartNumber: "86520-3X000",
      aiPrice: 34.99,
      sources: [
        {
          tier: "oem",
          vendor: "HyundaiPartsDeal",
          partNumber: "86520-3X000",
          price: 68.10,
          shipping: 0,
          coreCharge: 0,
          totalLanded: 68.10,
          inStock: true,
          url: "https://www.hyundaipartsdeal.com/genuine/hyundai-absorber-front-bumper~86520-3x000.html",
        },
        {
          tier: "aftermarket",
          vendor: "RockAuto",
          partNumber: "DORMAN-1611600",
          price: 28.49,
          shipping: 6.50,
          coreCharge: 0,
          totalLanded: 34.99,
          inStock: true,
          url: "https://www.rockauto.com/en/catalog/hyundai,2012,elantra,1.8l+l4,1481506,body,bumper+energy+absorber,2764",
        },
      ],
    },
    {
      id: "li-4",
      description: "Clip & Fastener Kit (Bumper Push-In Retainers)",
      category: "supplies",
      oemPartNumber: "09210-10200-KIT",
      aiPrice: 14.99,
      sources: [
        {
          tier: "aftermarket",
          vendor: "RockAuto",
          partNumber: "HELP-41741",
          price: 9.99,
          shipping: 4.99,
          coreCharge: 0,
          totalLanded: 14.99,
          inStock: true,
          url: "https://www.rockauto.com/en/catalog/hyundai,2012,elantra,1.8l+l4,1481506,body,bumper+retainer,2764",
        },
      ],
    },

    // ── LABOR ────────────────────────────────────────────────────────────────
    {
      id: "li-5",
      description: "Bumper Cover R&I (Remove & Install)",
      category: "labor",
      laborHours: 1.5,
      aiPrice: 135.00,   // $90/hr labor rate × 1.5h
      sources: [],
    },

    // ── PAINT ────────────────────────────────────────────────────────────────
    {
      id: "li-6",
      description: "Bumper Cover Respray — Match to Factory Color",
      category: "paint",
      laborHours: 3.0,
      aiPrice: 270.00,   // $90/hr × 3h, includes materials
      sources: [],
    },
  ];
}
