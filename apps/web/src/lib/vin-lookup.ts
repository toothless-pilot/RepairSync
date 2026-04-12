// VIN prefix lookup by make/model/year
// Format: [make keywords, model keywords, year range, VIN prefix]
type VinRule = {
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  prefix: string;
};

const VIN_RULES: VinRule[] = [
  // Hyundai Elantra
  { make: "hyundai", model: "elantra", yearStart: 2011, yearEnd: 2013, prefix: "5NPDH4AE" },
  { make: "hyundai", model: "elantra", yearStart: 2014, yearEnd: 2016, prefix: "5NPDH4AE" },
  { make: "hyundai", model: "elantra", yearStart: 2017, yearEnd: 2018, prefix: "5NPD84LF" },
  { make: "hyundai", model: "elantra", yearStart: 2019, yearEnd: 2020, prefix: "5NPD84LF" },
  { make: "hyundai", model: "elantra", yearStart: 2021, yearEnd: 2026, prefix: "KMHLS4AG" },

  // Hyundai Sonata
  { make: "hyundai", model: "sonata", yearStart: 2015, yearEnd: 2017, prefix: "5NPE24AF" },
  { make: "hyundai", model: "sonata", yearStart: 2018, yearEnd: 2026, prefix: "5NPEG4JA" },

  // Hyundai Tucson
  { make: "hyundai", model: "tucson", yearStart: 2016, yearEnd: 2021, prefix: "KM8J23A4" },
  { make: "hyundai", model: "tucson", yearStart: 2022, yearEnd: 2026, prefix: "5NMJB3AE" },

  // Toyota Camry
  { make: "toyota", model: "camry", yearStart: 2018, yearEnd: 2026, prefix: "4T1B11HK" },
  { make: "toyota", model: "camry", yearStart: 2012, yearEnd: 2017, prefix: "4T1BF1FK" },

  // Toyota Corolla
  { make: "toyota", model: "corolla", yearStart: 2020, yearEnd: 2026, prefix: "JTDEPRAE" },
  { make: "toyota", model: "corolla", yearStart: 2014, yearEnd: 2019, prefix: "2T1BURHEX" },

  // Toyota RAV4
  { make: "toyota", model: "rav4", yearStart: 2019, yearEnd: 2026, prefix: "2T3P1RFV" },
  { make: "toyota", model: "rav4", yearStart: 2013, yearEnd: 2018, prefix: "2T3BFREV" },

  // Honda Civic
  { make: "honda", model: "civic", yearStart: 2022, yearEnd: 2026, prefix: "19XFL1H6" },
  { make: "honda", model: "civic", yearStart: 2016, yearEnd: 2021, prefix: "2HGFC2F5" },
  { make: "honda", model: "civic", yearStart: 2012, yearEnd: 2015, prefix: "2HGFB2F5" },

  // Honda Accord
  { make: "honda", model: "accord", yearStart: 2018, yearEnd: 2026, prefix: "1HGCV1F3" },
  { make: "honda", model: "accord", yearStart: 2013, yearEnd: 2017, prefix: "1HGCR2F3" },

  // Honda CR-V
  { make: "honda", model: "cr-v", yearStart: 2017, yearEnd: 2026, prefix: "2HKRW2H5" },
  { make: "honda", model: "cr-v", yearStart: 2012, yearEnd: 2016, prefix: "2HKRM4H5" },

  // Ford F-150
  { make: "ford", model: "f-150", yearStart: 2021, yearEnd: 2026, prefix: "1FTFW1E8" },
  { make: "ford", model: "f-150", yearStart: 2015, yearEnd: 2020, prefix: "1FTEW1EP" },

  // Ford Mustang
  { make: "ford", model: "mustang", yearStart: 2015, yearEnd: 2026, prefix: "1FA6P8CF" },

  // Chevrolet Silverado
  { make: "chevrolet", model: "silverado", yearStart: 2019, yearEnd: 2026, prefix: "1GCPYBEK" },
  { make: "chevrolet", model: "silverado", yearStart: 2014, yearEnd: 2018, prefix: "1GCVKREC" },

  // Tesla Model 3
  { make: "tesla", model: "model 3", yearStart: 2017, yearEnd: 2026, prefix: "5YJ3E1EA" },

  // Tesla Model Y
  { make: "tesla", model: "model y", yearStart: 2020, yearEnd: 2026, prefix: "5YJYGDEE" },

  // Tesla Model S
  { make: "tesla", model: "model s", yearStart: 2012, yearEnd: 2026, prefix: "5YJSA1E2" },

  // BMW 3 Series
  { make: "bmw", model: "3 series", yearStart: 2019, yearEnd: 2026, prefix: "3MW5R7J0" },
  { make: "bmw", model: "3 series", yearStart: 2012, yearEnd: 2018, prefix: "WBA8E9G5" },

  // Toyota Prius
  { make: "toyota", model: "prius", yearStart: 2016, yearEnd: 2026, prefix: "JTDKARFU" },
  { make: "toyota", model: "prius", yearStart: 2010, yearEnd: 2015, prefix: "JTDKN3DU" },

  // Nissan Altima
  { make: "nissan", model: "altima", yearStart: 2019, yearEnd: 2026, prefix: "1N4BL4EV" },
  { make: "nissan", model: "altima", yearStart: 2013, yearEnd: 2018, prefix: "1N4AL3AP" },

  // Kia Optima / K5
  { make: "kia", model: "optima", yearStart: 2016, yearEnd: 2020, prefix: "5XXGU4L3" },
];

export function lookupVin(vehicleModel: string): string | null {
  const lower = vehicleModel.toLowerCase();

  // Extract year
  const yearMatch = lower.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0]) : null;

  for (const rule of VIN_RULES) {
    const makeMatch  = lower.includes(rule.make);
    const modelMatch = lower.includes(rule.model);
    const yearMatch  = year !== null ? (year >= rule.yearStart && year <= rule.yearEnd) : true;

    if (makeMatch && modelMatch && yearMatch) {
      return rule.prefix;
    }
  }

  return null;
}
