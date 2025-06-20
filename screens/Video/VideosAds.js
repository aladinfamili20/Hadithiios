import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import mobileAds, {BannerAd, TestIds, BannerAdSize} from 'react-native-google-mobile-ads';

const VideosAds = () => {
      // Test Ads
  
  // const testAdUnit = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz';
  
  //   Live ads
  const liveAdUnit = 'ca-app-pub-9427314859640201/5919265806';

  return (
    <View>
        <BannerAd
                 unitId={liveAdUnit}
                 size={BannerAdSize.ADAPTIVE_BANNER}
                 requestOptions={{requestNonPersonalizedAdsOnly: true}}
               />
       
               
       
               {/* <BannerAd
                 unitId={liveAdUnit}
                 size={BannerAdSize.ADAPTIVE_BANNER}
                 // size={BannerAdSize.BANNER}
                 requestOptions={{
                   requestNonPersonalizedAdsOnly: true,
                 }}
                 onAdLoaded={() => {
                   console.log('Ad loaded');
                 }}
                 onAdFailedToLoad={error => {
                   console.error('Ad failed to load: ', error);
                 }}
               /> */}
    </View>
  )
}

export default VideosAds

const styles = StyleSheet.create({})