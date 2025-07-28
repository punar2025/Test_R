import * as Location from 'expo-location';
import { Location as LocationType } from '../types';

class LocationService {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationType | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
      });

      const { latitude, longitude } = location.coords;

      // Get reverse geocoding information
      const geocoding = await this.reverseGeocode(latitude, longitude);

      return {
        latitude,
        longitude,
        ...geocoding,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<Partial<LocationType>> {
    try {
      const reverseGeocodedAddress = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocodedAddress.length > 0) {
        const address = reverseGeocodedAddress[0];
        return {
          address: this.formatAddress(address),
          city: address.city || address.district || undefined,
          country: address.country || undefined,
        };
      }

      return {};
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return {};
    }
  }

  private formatAddress(address: Location.LocationGeocodedAddress): string {
    const parts = [];
    
    if (address.streetNumber) parts.push(address.streetNumber);
    if (address.street) parts.push(address.street);
    if (address.district && address.district !== address.city) parts.push(address.district);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.country) parts.push(address.country);

    return parts.join(', ');
  }

  async watchPosition(callback: (location: LocationType | null) => void): Promise<Location.LocationSubscription | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        callback(null);
        return null;
      }

      return await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 50, // Update when moved 50 meters
        },
        async (location) => {
          const { latitude, longitude } = location.coords;
          const geocoding = await this.reverseGeocode(latitude, longitude);
          
          callback({
            latitude,
            longitude,
            ...geocoding,
          });
        }
      );
    } catch (error) {
      console.error('Error watching position:', error);
      callback(null);
      return null;
    }
  }

  async getLastKnownLocation(): Promise<LocationType | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getLastKnownPositionAsync({
        maxAge: 60000, // Accept locations up to 1 minute old
        requiredAccuracy: 1000, // Accept locations with accuracy up to 1000 meters
      });

      if (!location) {
        return null;
      }

      const { latitude, longitude } = location.coords;
      const geocoding = await this.reverseGeocode(latitude, longitude);

      return {
        latitude,
        longitude,
        ...geocoding,
      };
    } catch (error) {
      console.error('Error getting last known location:', error);
      return null;
    }
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async isLocationServicesEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  async openLocationSettings(): Promise<void> {
    try {
      await Location.enableNetworkProviderAsync();
    } catch (error) {
      console.error('Error opening location settings:', error);
    }
  }
}

export const locationService = new LocationService();