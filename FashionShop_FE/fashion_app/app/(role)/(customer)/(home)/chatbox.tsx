import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Để quay lại trang trước
import { SafeAreaView } from 'react-native-safe-area-context';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  product?: {
    name: string;
    price: string;
  };
};

const fakeProducts = [
  {
    id: '1',
    name: "Men's Stylish Tee Shirt",
    price: '$120.00',
    keywords: ['áo', 'tee', 'trắng', 'nam', 'stylish'],
  },
  {
    id: '2',
    name: "Men's Neck Tee Shirt",
    price: '$120.00',
    keywords: ['áo', 'cổ', 'trắng', 'nam', 'neck'],
  },
  {
    id: '3',
    name: 'Short Sleeve Polo Shirt',
    price: '$150.00',
    keywords: ['polo', 'ngắn', 'xanh', 'nam'],
  },
];

export default function ChatboxScreen() {
  const router = useRouter(); // Dùng để quay lại
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Bạn đang tìm gì hôm nay? Chúng tôi có giảm giá 40% toàn bộ sản phẩm mùa đông!',
      sender: 'bot',
    },
    {
      id: '2',
      text: 'Gợi ý: áo thun nam, polo, áo khoác...',
      sender: 'bot',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const findProductByKeyword = (keyword: string) => {
    const lowerKeyword = keyword.toLowerCase();
    return fakeProducts.find((p) =>
      p.keywords.some((k) => lowerKeyword.includes(k) || k.includes(lowerKeyword))
    );
  };

  const generateBotResponse = (userText: string): Message => {
    const product = findProductByKeyword(userText);

    if (product) {
      return {
        id: Date.now().toString(),
        text: `Tôi tìm thấy sản phẩm phù hợp:`,
        sender: 'bot',
        product: {
          name: product.name,
          price: product.price,
        },
      };
    }

    if (userText.toLowerCase().includes('giảm giá') || userText.toLowerCase().includes('sale')) {
      return {
        id: Date.now().toString(),
        text: 'Đang có chương trình GIẢM 40% TOÀN BỘ sản phẩm mùa đông! Nhanh tay mua ngay!',
        sender: 'bot',
      };
    }

    return {
      id: Date.now().toString(),
      text: 'Xin lỗi, tôi chưa hiểu rõ. Bạn có thể nói rõ hơn? (VD: áo thun, polo, giảm giá...)',
      sender: 'bot',
    };
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };

    const botReply = generateBotResponse(inputText);

    setMessages((prev) => [...prev, userMsg, botReply]);
    setInputText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleBack = () => {
    router.back(); // Quay lại trang trước (Home)
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    if (item.product) {
      return (
        <View style={[styles.messageContainer, styles.botContainer]}>
          <View style={styles.botBubble}>
            <Text style={styles.botText}>{item.text}</Text>
            <View style={styles.productCard}>
              <View style={styles.productImagePlaceholder}>
                <Text style={styles.placeholderText}>Áo</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.productName}>{item.product.name}</Text>
                <Text style={styles.productPrice}>{item.product.price}</Text>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>Xem ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, isUser ? styles.userContainer : styles.botContainer]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={isUser ? styles.userText : styles.botText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header với nút Back */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hỗ trợ mua sắm</Text>
          <Ionicons name="chatbubble-ellipses" size={24} color="#333" />
        </View>

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// === Cập nhật Style ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginLeft: -4,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  messageList: { padding: 16, paddingBottom: 10 },
  messageContainer: { marginVertical: 6 },
  userContainer: { alignItems: 'flex-end' },
  botContainer: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  botBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  userText: { color: 'white', fontSize: 15 },
  botText: { color: '#333', fontSize: 15 },
  productCard: {
    marginTop: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#eee',
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 28 },
  productName: { fontWeight: '600', color: '#333', fontSize: 14 },
  productPrice: { color: '#e91e63', fontWeight: 'bold', marginVertical: 4 },
  viewButton: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  viewButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#000000ff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});