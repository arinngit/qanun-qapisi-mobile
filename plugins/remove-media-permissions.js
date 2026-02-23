const {withAndroidManifest} = require('@expo/config-plugins');

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
