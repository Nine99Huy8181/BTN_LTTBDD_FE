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
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../../../services/api';

type Product = {
  id: number;
  name: string;
  price: number;
  inventory: number;
  image?: string;
};

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  products?: Product[];
};

export default function ChatboxScreen() {
  const router = useRouter();
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
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', { message: currentInput });
      const data = response.data;

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: 'bot',
        products: data.type === 'products' ? data.products : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, có lỗi kết nối. Vui lòng thử lại sau.',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleProductPress = (productId: number) => {
    // Navigate to product detail screen
    router.push(`/product/${productId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    // Render product cards
    if (item.products && item.products.length > 0) {
      return (
        <View style={[styles.messageContainer, styles.botContainer]}>
          <View style={styles.botMessageWithProducts}>
            {/* Message text */}
            <Text style={styles.botText}>{item.text}</Text>
            
            {/* Product cards */}
            <View style={styles.productsContainer}>
              {item.products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => handleProductPress(product.id)}
                  activeOpacity={0.7}
                >
                  {/* Product Image */}
                  {product.image ? (
                    <Image
                      source={{ uri: product.image }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.productImagePlaceholder}>
                      <Ionicons name="image-outline" size={32} color="#999" />
                    </View>
                  )}

                  {/* Product Info */}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.productPrice}>
                      {formatPrice(product.price)}
                    </Text>
                    <Text style={styles.productInventory}>
                      Còn: {product.inventory} sản phẩm
                    </Text>

                    {/* View Detail Button */}
                    <View style={styles.viewButtonWrapper}>
                      <Text style={styles.viewButtonText}>Xem chi tiết</Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFF" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      );
    }

    // Render normal text message
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userContainer : styles.botContainer,
        ]}
      >
        <View
          style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}
        >
          <Text style={isUser ? styles.userText : styles.botText}>
            {item.text}
          </Text>
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hỗ trợ mua sắm AI</Text>
          <Ionicons name="chatbubble-ellipses" size={24} color="#333" />
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f8f8' 
  },
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
  messageList: { 
    padding: 16, 
    paddingBottom: 10 
  },
  messageContainer: { 
    marginVertical: 6 
  },
  userContainer: { 
    alignItems: 'flex-end' 
  },
  botContainer: { 
    alignItems: 'flex-start' 
  },
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
  userText: { 
    color: 'white', 
    fontSize: 15 
  },
  botText: { 
    color: '#333', 
    fontSize: 15,
    lineHeight: 20,
  },
  
  // Product Message Styles
  botMessageWithProducts: {
    maxWidth: '95%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productsContainer: {
    marginTop: 12,
    gap: 12,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  productPrice: {
    color: '#e91e63',
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 4,
  },
  productInventory: {
    color: '#666',
    fontSize: 12,
    marginBottom: 8,
  },
  viewButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Input Styles
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
    backgroundColor: '#000000',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#666',
  },
});