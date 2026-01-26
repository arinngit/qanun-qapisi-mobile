const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Remove READ_MEDIA_IMAGES, READ_MEDIA_VIDEO, READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE,
 * RECORD_AUDIO, and CAMERA permissions to comply with Google Play policies.
 * 
 * The app does not use any media, storage, camera, or audio recording functionality.
 */
const withRemoveMediaPermissions = (config) => {
  return withAndroidManifest(config, (config) => {
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
            permissionName !== 'android.permission.RECORD_AUDIO' &&
            permissionName !== 'android.permission.CAMERA'
          );
        }
      );
    }

    return config;
  });
};

module.exports = withRemoveMediaPermissions;
