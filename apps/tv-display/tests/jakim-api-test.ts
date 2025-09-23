/**
 * Test script for JAKIM API integration
 */

import { jakimApi, getTodayPrayerTimes, MalaysianZone } from '../src/lib/services/jakim-api';

async function testJakimApi() {
  console.log('🕌 Testing JAKIM API Integration');
  console.log('================================');

  try {
    // Test 1: Get prayer times for Kuala Lumpur
    console.log('\n📍 Test 1: Kuala Lumpur Prayer Times');
    const klPrayerTimes = await getTodayPrayerTimes('test-masjid-kl', 'WLY01');
    console.log('✅ Success:', {
      date: klPrayerTimes.prayer_date,
      zone: 'WLY01',
      fajr: klPrayerTimes.fajr_time,
      maghrib: klPrayerTimes.maghrib_time,
      source: klPrayerTimes.source
    });

    // Test 2: Get prayer times for Johor
    console.log('\n📍 Test 2: Johor Prayer Times');
    const johorPrayerTimes = await getTodayPrayerTimes('test-masjid-johor', 'JHR02');
    console.log('✅ Success:', {
      date: johorPrayerTimes.prayer_date,
      zone: 'JHR02',
      fajr: johorPrayerTimes.fajr_time,
      maghrib: johorPrayerTimes.maghrib_time,
      source: johorPrayerTimes.source
    });

    // Test 3: Cache functionality
    console.log('\n💾 Test 3: Cache Functionality');
    const startTime = Date.now();
    const cachedTimes = await getTodayPrayerTimes('test-masjid-kl', 'WLY01');
    const endTime = Date.now();
    console.log('✅ Cache hit in:', endTime - startTime, 'ms');
    console.log('✅ Same data:', cachedTimes.prayer_date === klPrayerTimes.prayer_date);

    // Test 4: Multiple zones
    console.log('\n🌍 Test 4: Multiple Zones');
    const zones: MalaysianZone[] = ['WLY01', 'SGR01', 'JHR02', 'PNG01'];
    const today = new Date().toISOString().split('T')[0]!;
    const promises = zones.map(zone => 
      jakimApi.fetchPrayerTimes(`test-masjid-${zone}`, today, zone)
    );
    
    const results = await Promise.all(promises);
    results.forEach((result, index) => {
      console.log(`✅ Zone ${zones[index]}:`, {
        fajr: result.fajr_time,
        maghrib: result.maghrib_time
      });
    });

    console.log('\n🎉 All tests passed! JAKIM API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testJakimApi();
}

export { testJakimApi };