import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/AuthContext';
import { DeviceEventEmitter } from 'react-native';
import { CartService } from '@/services/cart.service';

export default function CustomerLayout() {
  const { user } = useAuth();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <Tabs
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
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart" size={25} color={color} />
          ),
        }}
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
      />
    </Tabs>
  );
}