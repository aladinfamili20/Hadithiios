import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ProfileHeaderInfo from './ProfileHeaderInfo'
import ProfileBio from './ProfileBio'
import ProfileAudience from './ProfileAudience'

const ProfileScreenHandler = () => {
  return (
    <View>
     <ProfileHeaderInfo/>
     <ProfileBio/>
     <ProfileAudience/>
    </View>
  )
}

export default ProfileScreenHandler

const styles = StyleSheet.create({})