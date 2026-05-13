const Zone = require('../models/Zone');
const winston = require('winston');

class ZoneResolutionService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Resolve IP address to zone
   * @param {string} ip - IP address to resolve
   * @returns {Promise<Object|null>} Zone object or null if not found
   */
  async resolveIP(ip) {
    try {
      // Check cache first
      const cacheKey = `zone_${ip}`;
      const cached = this.cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        return cached.zone;
      }

      // Find all zones that contain this IP
      const zones = await Zone.findAllByIP(ip);
      
      if (zones.length === 0) {
        // Cache negative result
        this.cache.set(cacheKey, { zone: null, timestamp: Date.now() });
        return null;
      }

      // Return the most specific zone (smallest subnet)
      const mostSpecificZone = zones.reduce((best, current) => {
        const bestPrefix = this.getPrefixLength(best.ipRange);
        const currentPrefix = this.getPrefixLength(current.ipRange);
        return currentPrefix > bestPrefix ? current : best;
      });

      // Cache positive result
      this.cache.set(cacheKey, { zone: mostSpecificZone, timestamp: Date.now() });
      
      return mostSpecificZone;
    } catch (error) {
      winston.error(`Error resolving IP ${ip} to zone:`, error);
      return null;
    }
  }

  /**
   * Get prefix length from CIDR notation
   * @param {string} cidr - CIDR notation (e.g., "10.0.2.0/24")
   * @returns {number} Prefix length
   */
  getPrefixLength(cidr) {
    if (!cidr.includes('/')) return 32; // Single IP
    return parseInt(cidr.split('/')[1]);
  }

  /**
   * Resolve multiple IPs to zones
   * @param {string[]} ips - Array of IP addresses
   * @returns {Promise<Object>} Mapping of IP to zone
   */
  async resolveMultipleIPs(ips) {
    const results = {};
    const promises = ips.map(async (ip) => {
      const zone = await this.resolveIP(ip);
      results[ip] = zone;
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Enrich threat data with zone information
   * @param {Object} threatData - Threat data object
   * @returns {Promise<Object>} Enriched threat data
   */
  async enrichThreatData(threatData) {
    try {
      const enriched = { ...threatData };

      // Resolve source IP
      if (threatData.sourceIP) {
        enriched.sourceZone = await this.resolveIP(threatData.sourceIP);
      }

      // Resolve destination IP
      if (threatData.destinationIP) {
        enriched.destinationZone = await this.resolveIP(threatData.destinationIP);
      }

      // Add zone-based risk assessment
      if (enriched.sourceZone) {
        enriched.zoneRiskLevel = enriched.sourceZone.riskLevel;
        enriched.zoneType = enriched.sourceZone.zoneType;
        enriched.zoneName = enriched.sourceZone.name;
        enriched.zoneBuilding = enriched.sourceZone.building;
        enriched.zoneDepartment = enriched.sourceZone.department;
      }

      return enriched;
    } catch (error) {
      winston.error('Error enriching threat data:', error);
      return threatData;
    }
  }

  /**
   * Get zones by risk level
   * @param {string} riskLevel - Risk level filter
   * @returns {Promise<Array>} Array of zones
   */
  async getZonesByRiskLevel(riskLevel) {
    return await Zone.find({ 
      riskLevel, 
      enabled: true, 
      isActive: true 
    }).sort({ name: 1 });
  }

  /**
   * Get zones by type
   * @param {string} zoneType - Zone type filter
   * @returns {Promise<Array>} Array of zones
   */
  async getZonesByType(zoneType) {
    return await Zone.find({ 
      zoneType, 
      enabled: true, 
      isActive: true 
    }).sort({ name: 1 });
  }

  /**
   * Update zone activity
   * @param {string} zoneId - Zone ID
   * @returns {Promise<void>}
   */
  async updateZoneActivity(zoneId) {
    try {
      await Zone.findByIdAndUpdate(zoneId, { 
        lastActivity: new Date(),
        $inc: { deviceCount: 1 }
      });
    } catch (error) {
      winston.error(`Error updating zone activity for ${zoneId}:`, error);
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout
    };
  }
}

// Singleton instance
const zoneResolutionService = new ZoneResolutionService();

module.exports = zoneResolutionService;
