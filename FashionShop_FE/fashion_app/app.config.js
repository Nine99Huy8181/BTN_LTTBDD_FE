export default {
  expo: {
    name: "Fashion App",
    slug: "fashion_app",
    version: "1.0.0",
    // Add your EAS Project ID here (replace the placeholder with the real UUID)
    // You can obtain the projectId by running `eas build` and following the prompts,
    // or from your project page on https://expo.dev if the project is already created.
    projectId: "fcdd3db2-7bf7-4e68-9f00-0b63e24adb9e",
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
      "expo-web-browser",
      [
        "expo-notifications",
        {
          icon: "./assets/images/fashionapp.png",
          color: "#000000",
          modes: ["production"],
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      // API URL - Railway production
      // apiUrl: 'https://btnlttbdd-production.up.railway.app/api',
      apiUrl: 'http://192.168.1.6:8080/api',
      eas: {
        projectId: "fcdd3db2-7bf7-4e68-9f00-0b63e24adb9e"
      }
    },
  },
};