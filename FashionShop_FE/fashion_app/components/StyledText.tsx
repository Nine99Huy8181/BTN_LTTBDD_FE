// components/StyledText.tsx
import React from 'react';
import { Text as RNText, StyleSheet, TextProps } from 'react-native';

/**
 * Custom Text component với font serif mặc định
 * Sử dụng component này thay thế cho Text của React Native
 * để có font family nhất quán trong toàn bộ app
 */
export function StyledText(props: TextProps) {
    const { style, ...otherProps } = props;

    return (
        <RNText
            {...otherProps}
            style={[styles.defaultFont, style]}
        />
    );
}

const styles = StyleSheet.create({
    defaultFont: {
        fontFamily: 'serif',
    },
});

// Export default để có thể dùng cả 2 cách import
export default StyledText;
