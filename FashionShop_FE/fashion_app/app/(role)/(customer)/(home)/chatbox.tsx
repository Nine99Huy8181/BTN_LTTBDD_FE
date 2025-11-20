import React, { useState, useRef, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const flatListRef = useRef<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const lastMessageCountRef = useRef(2); // Track to know when new message arrives
  const isAutoScrollEnabledRef = useRef(true); // control whether auto-scroll should happen

  useEffect(() => {
    // Only scroll when new messages are added
    if (messages.length > lastMessageCountRef.current) {
      // Scroll to top of inverted list (offset 0) so newest message is visible
      // Only auto-scroll when auto-scroll is enabled (user not browsing history)
      if (isAutoScrollEnabledRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 120);
      }
      lastMessageCountRef.current = messages.length;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // when user sends a message, re-enable auto-scroll so the new message + response are shown
    isAutoScrollEnabledRef.current = true;

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
      const payload: any = { message: currentInput };
      if (sessionId) payload.sessionId = sessionId;

      const response = await api.post('/chat', payload);
      const data = response.data;

      // persist session id returned by server
      if (data.sessionId) {
        setSessionId(data.sessionId);
        await AsyncStorage.setItem('CHAT_SESSION_ID', data.sessionId);
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: 'bot',
        products: data.type === 'products' ? data.products : undefined,
      };

      setMessages((prev) => {
        const updated = [...prev, botMsg];
        console.log('Bot message added, total messages:', updated.length);
        return updated;
      });
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
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleProductPress = (productId: number) => {
    // Navigate to product detail screen
    router.push(`/product/${productId}`);
  };

  // Load sessionId and history on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const sid = await AsyncStorage.getItem('CHAT_SESSION_ID');
        if (sid) {
          setSessionId(sid);
          // Lấy lịch sử chat từ server (nếu session chưa hết hạn)
          const resp = await api.get(`/chat/${sid}`);
          const items: any[] = resp.data || [];
          const restored: Message[] = items.map((it, index) => {
            const msg: Message = {
              id: `restored_${sid}_${index}`, // Đảm bảo ID unique cho khôi phục lịch sử
              text: it.content,
              sender: it.sender === 'user' ? 'user' : 'bot',
            };

            // Nếu là tin nhắn sản phẩm, lấy danh sách sản phẩm
            if (it.type === 'products' && it.products) {
              msg.products = it.products;
            }
            return msg;
          });

          if (mounted && restored.length > 0) {
            setMessages((prev) => {
              const updated = [...prev, ...restored];
              return updated;
            });
          }
        }
      } catch (e) {
        console.warn('Không thể khôi phục lịch sử chat', e);
        // Session có thể đã hết hạn hoặc không tồn tại, không cần lỗi
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
            
            {/* Product cards - Horizontal ScrollView */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.productsContainer}
              contentContainerStyle={{ gap: 12, paddingRight: 8 }}
            >
              {item.products.map((product) => (
                <TouchableOpacity
                  key={`${item.id}_product_${product.id}`}
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
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
          data={[...messages].reverse()}
          inverted={true}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            if (isAutoScrollEnabledRef.current) {
              flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }
          }}
          onLayout={() => {
            if (isAutoScrollEnabledRef.current) {
              flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }
          }}
          // track user scroll to disable auto-scroll when user is browsing history
          onScroll={(e) => {
            const offsetY = e.nativeEvent.contentOffset.y || 0;
            // For inverted list: offset 0 means newest (top). If user scrolls away (offset > threshold), disable auto-scroll
            const THRESHOLD = 20;
            if (offsetY > THRESHOLD) {
              isAutoScrollEnabledRef.current = false;
            } else {
              isAutoScrollEnabledRef.current = true;
            }
          }}
          scrollEventThrottle={16}
          initialNumToRender={20}
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
    paddingBottom: 120,
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
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productsContainer: {
    marginTop: 10,
    maxHeight: 180,
  },
  productCard: {
    width: 130, // Fixed width
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 6,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: '600',
    color: '#333',
    fontSize: 11,
    lineHeight: 13,
    marginBottom: 3,
  },
  productPrice: {
    color: '#e91e63',
    fontWeight: 'bold',
    fontSize: 12,
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