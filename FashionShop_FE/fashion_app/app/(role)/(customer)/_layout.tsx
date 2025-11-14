import React, { useEffect, useState } from 'react';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/AuthContext';
import { DeviceEventEmitter } from 'react-native';
import { CartService } from '@/services/cart.service';
import { useNotification } from '@/hooks/NotificationContext';

export default function CustomerLayout() {
  const { user } = useAuth();
  const { unreadCount } = useNotification();
  const [badgeCount, setBadgeCount] = useState<number | undefined>(undefined);
  const loadBadge = async () => {
    try {
      if (!user || !user.accountId) {
        setBadgeCount(undefined);
        return;
      }
      const customers: any = await CartService.getCustomersByAccountId(user.accountId as number);
      if (!customers || customers.length === 0) {
        setBadgeCount(undefined);
        return;
      }
      const customerId = customers[0].customerID;
      let cart = await CartService.getCartByCustomerId(customerId);
      if (!cart) {
        setBadgeCount(undefined);
        return;
      }
      const items = await CartService.getCartItemsByCartId(cart.cartID);
      setBadgeCount(items?.length ? items.length : undefined);
    } catch (err) {
      console.error('Failed to load cart badge', err);
      setBadgeCount(undefined);
    }
  };

  useEffect(() => {
    loadBadge();
    const sub = DeviceEventEmitter.addListener('cartUpdated', () => {
      loadBadge();
    });
    return () => sub.remove();
  }, [user]);

  return (
    <Tabs
      // unmount handled per-screen below to ensure compatibility with BottomTabNavigationOptions types
      screenOptions={{
        tabBarActiveTintColor: '#000000ff',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={25} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: () => {
            // Reset the nested stack by replacing the route with the tab's root
            router.replace('/(role)/(customer)/(home)');
          },
        })}
      />
      <Tabs.Screen
        name="(cart)"
        options={{
          title: 'Cart',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="cart" size={25} color={color} />
          ),
          tabBarBadge: badgeCount && badgeCount > 0 ? badgeCount : undefined,
        }}
        listeners={() => ({
          tabPress: () => {
            router.replace('/(role)/(customer)/(cart)');
          },
        })}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart" size={25} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: () => {
            router.replace('/(role)/(customer)/wishlist');
          },
        })}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: 'Notification',
          headerShown: false,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications" size={25} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: () => {
            router.replace('/(role)/(customer)/notification');
          },
        })}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={25} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: () => {
            router.replace('/(role)/(customer)/(profile)');
          },
        })}
      />
    </Tabs>
  );
}