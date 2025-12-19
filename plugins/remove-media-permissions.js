const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Remove READ_MEDIA_IMAGES, READ_MEDIA_VIDEO, READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE,
 * and RECORD_AUDIO permissions to comply with Google Play policies.
 * 
 * The app uses Android Photo Picker (Android 13+) which doesn't require media permissions.
 * The app does not use audio recording functionality.
 */
const withRemoveMediaPermissions = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    if (androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = androidManifest['uses-permission'].filter(
        (permission) => {
          const permissionName = permission.$['android:name'];
          return (
            permissionName !== 'android.permission.READ_MEDIA_IMAGES' &&
            permissionName !== 'android.permission.READ_MEDIA_VIDEO' &&
            permissionName !== 'android.permission.READ_EXTERNAL_STORAGE' &&
            permissionName !== 'android.permission.WRITE_EXTERNAL_STORAGE' &&
            permissionName !== 'android.permission.RECORD_AUDIO'
          );
        }
      );
    }

    return config;
  });
};

module.exports = withRemoveMediaPermissions;
