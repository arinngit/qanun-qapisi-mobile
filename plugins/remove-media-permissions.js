const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Remove READ_MEDIA_IMAGES, READ_MEDIA_VIDEO, and READ_EXTERNAL_STORAGE permissions
 * to comply with Google Play's Photo and Video Permissions policy.
 * 
 * The app uses Android Photo Picker (Android 13+) which doesn't require these permissions.
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
            permissionName !== 'android.permission.WRITE_EXTERNAL_STORAGE'
          );
        }
      );
    }

    return config;
  });
};

module.exports = withRemoveMediaPermissions;
