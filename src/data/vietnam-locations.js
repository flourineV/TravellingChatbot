/**
 * Comprehensive Vietnamese locations database
 * Companies, landmarks, hospitals, malls, airports, etc.
 */

// Major companies and tech parks
export const VIETNAM_COMPANIES = {
  // Ho Chi Minh City
  "FPT_HCM": {
    name: "FPT Software TP.HCM",
    type: "company",
    city: "TP. Hồ Chí Minh",
    district: "Quận 7",
    area: "Khu đô thị Phú Mỹ Hưng",
    coordinates: { lat: 10.7285, lng: 106.7317 },
    nearbyLandmarks: ["Crescent Mall", "Lotte Mart", "Starlight Bridge"],
    category: "technology"
  },

  "VIETTEL_HCM": {
    name: "Tập đoàn Viettel TP.HCM",
    type: "company", 
    city: "TP. Hồ Chí Minh",
    district: "Quận 10",
    area: "Trung tâm thành phố",
    coordinates: { lat: 10.7727, lng: 106.6672 },
    nearbyLandmarks: ["Chợ An Đông", "Bệnh viện Chợ Rẫy", "Công viên Tao Đàn"],
    category: "telecommunications"
  },

  "BITEXCO": {
    name: "Tòa nhà Bitexco Financial Tower",
    type: "landmark",
    city: "TP. Hồ Chí Minh", 
    district: "Quận 1",
    area: "Trung tâm tài chính",
    coordinates: { lat: 10.7717, lng: 106.7041 },
    nearbyLandmarks: ["Chợ Bến Thành", "Nhà hát Thành phố", "Phố đi bộ Nguyễn Huệ"],
    category: "business"
  },

  // Hanoi
  "FPT_HN": {
    name: "FPT Software Hà Nội",
    type: "company",
    city: "Hà Nội",
    district: "Cầu Giấy", 
    area: "Dịch Vọng",
    coordinates: { lat: 21.0285, lng: 105.7774 },
    nearbyLandmarks: ["Keangnam Landmark", "Big C Thăng Long", "Lotte Center"],
    category: "technology"
  },

  "VIETTEL_HN": {
    name: "Tập đoàn Viettel Hà Nội",
    type: "company",
    city: "Hà Nội",
    district: "Hai Bà Trưng",
    area: "Bách Khoa",
    coordinates: { lat: 21.0045, lng: 105.8412 },
    nearbyLandmarks: ["ĐH Bách Khoa Hà Nội", "Hồ Hoàn Kiếm", "Phố cổ"],
    category: "telecommunications"
  }
};

// Major shopping malls and commercial centers
export const VIETNAM_MALLS = {
  // Ho Chi Minh City
  "VINCOM_DONG_KHOI": {
    name: "Vincom Center Đồng Khởi",
    type: "mall",
    city: "TP. Hồ Chí Minh",
    district: "Quận 1", 
    area: "Trung tâm thành phố",
    coordinates: { lat: 10.7796, lng: 106.7019 },
    nearbyLandmarks: ["Nhà hát Thành phố", "Khách sạn Rex", "Phố đi bộ Nguyễn Huệ"],
    category: "shopping"
  },

  "SAIGON_CENTRE": {
    name: "Saigon Centre",
    type: "mall",
    city: "TP. Hồ Chí Minh",
    district: "Quận 1",
    area: "Lê Lợi",
    coordinates: { lat: 10.7743, lng: 106.7005 },
    nearbyLandmarks: ["Chợ Bến Thành", "Bitexco", "Nhà thờ Đức Bà"],
    category: "shopping"
  },

  "CRESCENT_MALL": {
    name: "Crescent Mall",
    type: "mall", 
    city: "TP. Hồ Chí Minh",
    district: "Quận 7",
    area: "Phú Mỹ Hưng",
    coordinates: { lat: 10.7285, lng: 106.7317 },
    nearbyLandmarks: ["FPT Software", "Lotte Mart", "Starlight Bridge"],
    category: "shopping"
  },

  // Hanoi
  "VINCOM_BA_TRIEU": {
    name: "Vincom Center Bà Triệu",
    type: "mall",
    city: "Hà Nội",
    district: "Hai Bà Trưng",
    area: "Bà Triệu",
    coordinates: { lat: 21.0167, lng: 105.8400 },
    nearbyLandmarks: ["Hồ Hoàn Kiếm", "Phố cổ", "Nhà hát Lớn"],
    category: "shopping"
  },

  "LOTTE_CENTER_HN": {
    name: "Lotte Center Hanoi",
    type: "mall",
    city: "Hà Nội", 
    district: "Ba Đình",
    area: "Liễu Giai",
    coordinates: { lat: 21.0278, lng: 105.8342 },
    nearbyLandmarks: ["Lăng Bác", "Chùa Một Cột", "Bảo tàng Hồ Chí Minh"],
    category: "shopping"
  }
};

// Major hospitals
export const VIETNAM_HOSPITALS = {
  // Ho Chi Minh City
  "CHO_RAY": {
    name: "Bệnh viện Chợ Rẫy",
    type: "hospital",
    city: "TP. Hồ Chí Minh",
    district: "Quận 5",
    area: "Chợ Rẫy", 
    coordinates: { lat: 10.7539, lng: 106.6654 },
    nearbyLandmarks: ["Chợ An Đông", "Bình Tây Market", "Quận 5"],
    category: "healthcare"
  },

  "BACH_MAI_HCM": {
    name: "Bệnh viện Bạch Mai TP.HCM",
    type: "hospital",
    city: "TP. Hồ Chí Minh",
    district: "Quận 10",
    area: "3 Tháng 2",
    coordinates: { lat: 10.7727, lng: 106.6672 },
    nearbyLandmarks: ["Chợ An Đông", "Công viên Tao Đàn", "Viettel"],
    category: "healthcare"
  },

  // Hanoi
  "BACH_MAI_HN": {
    name: "Bệnh viện Bạch Mai",
    type: "hospital", 
    city: "Hà Nội",
    district: "Đống Đa",
    area: "Giải Phóng",
    coordinates: { lat: 21.0030, lng: 105.8435 },
    nearbyLandmarks: ["ĐH Kinh tế Quốc dân", "Hồ Hoàn Kiếm", "Phố cổ"],
    category: "healthcare"
  },

  "VIET_DUC": {
    name: "Bệnh viện Việt Đức",
    type: "hospital",
    city: "Hà Nội",
    district: "Hoàn Kiếm", 
    area: "Phúc Tân",
    coordinates: { lat: 21.0285, lng: 105.8542 },
    nearbyLandmarks: ["Phố cổ", "Hồ Hoàn Kiếm", "Nhà hát Lớn"],
    category: "healthcare"
  }
};

// Major airports and transportation hubs
export const VIETNAM_TRANSPORT_HUBS = {
  "TSN_AIRPORT": {
    name: "Sân bay Tân Sơn Nhất",
    type: "airport",
    city: "TP. Hồ Chí Minh",
    district: "Tân Bình",
    area: "Tân Sơn Nhất",
    coordinates: { lat: 10.8187, lng: 106.6520 },
    nearbyLandmarks: ["Aeon Mall Tân Phú", "Đầm Sen", "Quận Tân Bình"],
    category: "transportation"
  },

  "NOI_BAI_AIRPORT": {
    name: "Sân bay Nội Bài", 
    type: "airport",
    city: "Hà Nội",
    district: "Sóc Sơn",
    area: "Nội Bài",
    coordinates: { lat: 21.2187, lng: 105.8070 },
    nearbyLandmarks: ["Khu công nghiệp Nội Bài", "Sóc Sơn", "Đông Anh"],
    category: "transportation"
  },

  "MIEN_DONG_BUS": {
    name: "Bến xe Miền Đông",
    type: "bus_station",
    city: "TP. Hồ Chí Minh", 
    district: "Bình Thạnh",
    area: "Đinh Bộ Lĩnh",
    coordinates: { lat: 10.8148, lng: 106.7106 },
    nearbyLandmarks: ["Landmark 81", "Vinhomes Central Park", "Quận Bình Thạnh"],
    category: "transportation"
  }
};

// Combine all locations
export const ALL_VIETNAM_LOCATIONS = {
  ...VIETNAM_COMPANIES,
  ...VIETNAM_MALLS, 
  ...VIETNAM_HOSPITALS,
  ...VIETNAM_TRANSPORT_HUBS
};

// Location aliases and common names
export const LOCATION_ALIASES = {
  // Companies
  "fpt": ["FPT_HCM", "FPT_HN"],
  "viettel": ["VIETTEL_HCM", "VIETTEL_HN"],
  "bitexco": ["BITEXCO"],
  
  // Malls
  "vincom": ["VINCOM_DONG_KHOI", "VINCOM_BA_TRIEU"],
  "lotte": ["LOTTE_CENTER_HN"],
  "crescent": ["CRESCENT_MALL"],
  
  // Hospitals
  "chợ rẫy": ["CHO_RAY"],
  "bạch mai": ["BACH_MAI_HCM", "BACH_MAI_HN"],
  "việt đức": ["VIET_DUC"],
  
  // Transport
  "tân sơn nhất": ["TSN_AIRPORT"],
  "nội bài": ["NOI_BAI_AIRPORT"],
  "sân bay": ["TSN_AIRPORT", "NOI_BAI_AIRPORT"],
  "bến xe": ["MIEN_DONG_BUS"]
};

/**
 * Find locations by name or alias
 * @param {string} query - Location name or alias
 * @returns {Array} Array of matching locations
 */
export function findLocationsByName(query) {
  const normalizedQuery = query.toLowerCase();
  const matches = [];

  // Direct match by key
  for (const [code, info] of Object.entries(ALL_VIETNAM_LOCATIONS)) {
    if (code.toLowerCase().includes(normalizedQuery) ||
        info.name.toLowerCase().includes(normalizedQuery)) {
      matches.push({ code, ...info });
    }
  }

  // Alias match
  for (const [alias, codes] of Object.entries(LOCATION_ALIASES)) {
    if (normalizedQuery.includes(alias)) {
      codes.forEach(code => {
        if (ALL_VIETNAM_LOCATIONS[code] && !matches.find(m => m.code === code)) {
          matches.push({ code, ...ALL_VIETNAM_LOCATIONS[code] });
        }
      });
    }
  }

  return matches;
}

/**
 * Get location context for search enhancement
 * @param {string} locationCode - Location code
 * @returns {Object} Location context or null
 */
export function getLocationContext(locationCode) {
  const location = ALL_VIETNAM_LOCATIONS[locationCode.toUpperCase()];
  if (!location) return null;

  return {
    location: { code: locationCode.toUpperCase(), ...location },
    searchContext: `${location.city} ${location.district} ${location.area}`,
    nearbyKeywords: location.nearbyLandmarks.join(' '),
    category: location.category
  };
}

/**
 * Get locations by city
 * @param {string} city - City name
 * @returns {Array} Locations in the city
 */
export function getLocationsByCity(city) {
  const normalizedCity = city.toLowerCase();
  const matches = [];

  for (const [code, info] of Object.entries(ALL_VIETNAM_LOCATIONS)) {
    if (info.city.toLowerCase().includes(normalizedCity)) {
      matches.push({ code, ...info });
    }
  }

  return matches;
}

/**
 * Get locations by type
 * @param {string} type - Location type (company, mall, hospital, etc.)
 * @returns {Array} Locations of the specified type
 */
export function getLocationsByType(type) {
  const matches = [];

  for (const [code, info] of Object.entries(ALL_VIETNAM_LOCATIONS)) {
    if (info.type === type || info.category === type) {
      matches.push({ code, ...info });
    }
  }

  return matches;
}
