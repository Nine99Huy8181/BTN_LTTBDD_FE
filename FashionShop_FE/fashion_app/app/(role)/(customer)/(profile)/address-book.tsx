// app/(customer)/(profile)/address-book.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function AddressBookScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Sổ địa chỉ</Text>
      <Button title="Add Address" onPress={() => router.push('/(customer)/(profile)/add-address')} />
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}