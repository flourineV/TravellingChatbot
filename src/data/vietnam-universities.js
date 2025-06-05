/**
 * Comprehensive knowledge base for Vietnamese locations
 * Universities, companies, landmarks, hospitals, malls, etc.
 * Used to provide better context for location-specific queries
 */

export const VIETNAM_UNIVERSITIES = {
  // Ho Chi Minh City Universities
  "UIT": {
    fullName: "Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM",
    city: "TP. Hồ Chí Minh",
    district: "Thủ Đức",
    area: "Khu Công nghệ cao",
    coordinates: { lat: 10.8700, lng: 106.8030 },
    nearbyLandmarks: ["Khu Công nghệ cao", "Đại học Quốc gia TP.HCM", "Suối Tiên"]
  },
  
  "HCMUS": {
    fullName: "Trường Đại học Khoa học Tự nhiên - ĐHQG TP.HCM",
    city: "TP. Hồ Chí Minh", 
    district: "Thủ Đức",
    area: "Đại học Quốc gia",
    coordinates: { lat: 10.8700, lng: 106.8030 },
    nearbyLandmarks: ["Đại học Quốc gia TP.HCM", "UIT", "Khu Công nghệ cao"]
  },

  "HCMUT": {
    fullName: "Trường Đại học Bách khoa - ĐHQG TP.HCM",
    city: "TP. Hồ Chí Minh",
    district: "Thủ Đức", 
    area: "Đại học Quốc gia",
    coordinates: { lat: 10.8700, lng: 106.8030 },
    nearbyLandmarks: ["Đại học Quốc gia TP.HCM", "UIT", "HCMUS"]
  },

  "UEH": {
    fullName: "Trường Đại học Kinh tế TP.HCM",
    city: "TP. Hồ Chí Minh",
    district: "Quận 1",
    area: "Trung tâm thành phố",
    coordinates: { lat: 10.7769, lng: 106.6955 },
    nearbyLandmarks: ["Chợ Bến Thành", "Nhà thờ Đức Bà", "Dinh Thống Nhất"]
  },

  // Hanoi Universities
  "HUST": {
    fullName: "Trường Đại học Bách khoa Hà Nội",
    city: "Hà Nội",
    district: "Hai Bà Trưng",
    area: "Trung tâm Hà Nội",
    coordinates: { lat: 21.0045, lng: 105.8412 },
    nearbyLandmarks: ["Hồ Hoàn Kiếm", "Phố cổ Hà Nội", "Văn Miếu"]
  },

  "VNU": {
    fullName: "Đại học Quốc gia Hà Nội",
    city: "Hà Nội",
    district: "Cầu Giấy",
    area: "Xuân Thủy",
    coordinates: { lat: 21.0380, lng: 105.7820 },
    nearbyLandmarks: ["Keangnam", "Big C Thăng Long", "Cầu Nhật Tân"]
  },

  "NEU": {
    fullName: "Trường Đại học Kinh tế Quốc dân",
    city: "Hà Nội",
    district: "Hai Bà Trưng",
    area: "Giải Phóng",
    coordinates: { lat: 21.0170, lng: 105.8430 },
    nearbyLandmarks: ["Bách Khoa Hà Nội", "Hồ Hoàn Kiếm", "Chợ Đồng Xuân"]
  },

  // Da Nang Universities
  "DUT": {
    fullName: "Trường Đại học Bách khoa Đà Nẵng",
    city: "Đà Nẵng",
    district: "Hải Châu",
    area: "Trung tâm Đà Nẵng",
    coordinates: { lat: 16.0544, lng: 108.2022 },
    nearbyLandmarks: ["Cầu Rồng", "Chợ Hàn", "Bãi biển Mỹ Khê"]
  },

  // Can Tho Universities  
  "CTU": {
    fullName: "Trường Đại học Cần Thơ",
    city: "Cần Thơ",
    district: "Ninh Kiều",
    area: "Trung tâm Cần Thơ",
    coordinates: { lat: 10.0300, lng: 105.7700 },
    nearbyLandmarks: ["Chợ nổi Cái Răng", "Bến Ninh Kiều", "Cầu Cần Thơ"]
  }
};

// Common university aliases and variations
export const UNIVERSITY_ALIASES = {
  "bách khoa": ["HCMUT", "HUST", "DUT"],
  "bk": ["HCMUT", "HUST", "DUT"],
  "đại học quốc gia": ["VNU", "HCMUS", "UIT", "HCMUT"],
  "dhqg": ["VNU", "HCMUS", "UIT", "HCMUT"],
  "kinh tế": ["UEH", "NEU"],
  "công nghệ thông tin": ["UIT"],
  "khoa học tự nhiên": ["HCMUS"]
};

/**
 * Find university by name or alias
 * @param {string} query - University name or alias
 * @returns {Array} Array of matching universities
 */
export function findUniversities(query) {
  const normalizedQuery = query.toLowerCase();
  const matches = [];

  // Direct match
  for (const [code, info] of Object.entries(VIETNAM_UNIVERSITIES)) {
    if (code.toLowerCase() === normalizedQuery ||
        info.fullName.toLowerCase().includes(normalizedQuery)) {
      matches.push({ code, ...info });
    }
  }

  // Alias match
  for (const [alias, codes] of Object.entries(UNIVERSITY_ALIASES)) {
    if (normalizedQuery.includes(alias)) {
      codes.forEach(code => {
        if (VIETNAM_UNIVERSITIES[code] && !matches.find(m => m.code === code)) {
          matches.push({ code, ...VIETNAM_UNIVERSITIES[code] });
        }
      });
    }
  }

  return matches;
}

/**
 * Get universities by city
 * @param {string} city - City name
 * @returns {Array} Universities in the city
 */
export function getUniversitiesByCity(city) {
  const normalizedCity = city.toLowerCase();
  const matches = [];

  for (const [code, info] of Object.entries(VIETNAM_UNIVERSITIES)) {
    if (info.city.toLowerCase().includes(normalizedCity)) {
      matches.push({ code, ...info });
    }
  }

  return matches;
}

/**
 * Get nearby attractions for a university
 * @param {string} universityCode - University code
 * @returns {Object} University info with nearby attractions
 */
export function getUniversityContext(universityCode) {
  const university = VIETNAM_UNIVERSITIES[universityCode.toUpperCase()];
  if (!university) return null;

  return {
    university: { code: universityCode.toUpperCase(), ...university },
    searchContext: `${university.city} ${university.district} ${university.area}`,
    nearbyKeywords: university.nearbyLandmarks.join(' ')
  };
}

// Import and re-export comprehensive location functions
import {
  ALL_VIETNAM_LOCATIONS,
  LOCATION_ALIASES,
  findLocationsByName,
  getLocationContext
} from './vietnam-locations.js';

export {
  ALL_VIETNAM_LOCATIONS,
  LOCATION_ALIASES,
  findLocationsByName,
  getLocationContext
};
