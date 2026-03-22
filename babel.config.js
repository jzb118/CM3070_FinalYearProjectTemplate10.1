module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        // Temporarily disabled to bypass CMake build issues with path spaces
        // plugins: ['react-native-reanimated/plugin'],
    };
};
