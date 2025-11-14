const { getApiUrl } = require('./scripts/getLocalIP');

export default {
  expo: {
    name: "fashion_app",
    slug: "fashion_app",
    version: "1.0.0",
    // Add your EAS Project ID here (replace the placeholder with the real UUID)
    // You can obtain the projectId by running `eas build` and following the prompts,
    // or from your project page on https://expo.dev if the project is already created.
    projectId: process.env.EAS_PROJECT_ID || "REPLACE_WITH_YOUR_EAS_PROJECT_ID",
    orientation: "portrait",
    icon: "./assets/images/fashionapp.png",
    scheme: "fashionapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.fashionapp",
      // Thêm config cho deep link
      infoPlist: {
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: ["fashionapp"]
          }
        ]
      }
    },
    android: {
      package: "com.yourcompany.fashionapp",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      // QUAN TRỌNG: Thêm intent filter cho deep link
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "fashionapp",
              host: "payment-return"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      output: "static",
      favicon: "./assets/images/fashionapp.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/fashionapp.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-secure-store",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      apiUrl: getApiUrl() || process.env.API_URL,
    },
  },
};