// PortelX Type Declarations (pre-install fallbacks to resolve VS Code red errors)
declare module 'react' {
  export = React;
}
declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const TextInput: any;
  export const TouchableOpacity: any;
  export const StyleSheet: any;
  export const ActivityIndicator: any;
  export const Alert: any;
  export const FlatList: any;
  export const ScrollView: any;
}
declare module 'react-native-safe-area-context' {
  export const SafeAreaView: any;
  export const SafeAreaProvider: any;
}
declare module 'react-native-screens';
declare module 'react-native-reanimated';
declare module '@react-navigation/native' {
  export const NavigationContainer: any;
}
declare module '@react-navigation/native-stack' {
  export function createNativeStackNavigator<T>(): any;
  export type NativeStackScreenProps<P, K extends keyof P> = {
    navigation: any;
    route: { params: P[K] };
  };
}
declare module 'expo-status-bar' {
  export const StatusBar: any;
}
declare module 'expo-camera';
declare module 'expo-screen-capture';
declare module 'expo-local-authentication';
declare module 'expo-notifications';
declare module 'axios' {
  const axios: any;
  export default axios;
}
declare module 'zustand' {
  export const create: any;
}
