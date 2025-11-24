import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';

const { width, height: screenHeight } = Dimensions.get('screen');

export type ButtonType = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

interface CustomAlertDialogProps {
  isVisible: boolean;
  title: string;
  message: string;
  buttons: ButtonType[];
  onClose: () => void;
}

const CustomAlertDialog: React.FC<CustomAlertDialogProps> = ({
  isVisible,
  title,
  message,
  buttons,
  onClose,
}) => {
  const handlePress = (onPressFunc?: () => void) => {
    onPressFunc?.();
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={200}
      animationOutTiming={180}
      backdropTransitionInTiming={0}   // Hiện backdrop ngay
      backdropTransitionOutTiming={0}  // Tắt backdrop ngay → fix lag bóng
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      backdropOpacity={0.5}
      deviceHeight={screenHeight}
      statusBarTranslucent={Platform.OS === 'android'} // Fix full height trên Android
      style={styles.modal} // margin: 0 là bắt buộc
    >
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttonContainer}>
          {buttons.map((button, index) => {
            const isDestructive = button.style === 'destructive';
            const isCancel = button.style === 'cancel';

            const buttonStyle: any = [
              styles.button,
              isDestructive && styles.destructiveButton,
              isCancel ? styles.cancelButton : styles.defaultButton,
            ];

            const textStyle: any = [
              styles.buttonText,
              isDestructive && styles.destructiveText,
              isCancel ? styles.cancelText : styles.defaultText,
            ];

            // Layout cho 2 nút (Cancel | Action)
            if (buttons.length === 2) {
              if (index === 0) {
                buttonStyle.push({ flex: 1, marginRight: 8 });
              } else {
                buttonStyle.push({ flex: 1 });
              }
            } else {
              if (index > 0) buttonStyle.push({ marginLeft: 12 });
            }

            return (
              <TouchableOpacity
                key={index}
                style={buttonStyle}
                onPress={() => handlePress(button.onPress)}
                activeOpacity={0.8}
              >
                <Text style={textStyle}>{button.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0, // QUAN TRỌNG: loại bỏ margin mặc định của modal
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    width: width * 0.85,
    maxWidth: 340,
    borderRadius: 14,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  button: {
    minWidth: 90,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15.5,
    fontWeight: '600',
  },

  // Styles nút
  cancelButton: { backgroundColor: '#f0f0f0' },
  cancelText: { color: '#333' },

  defaultButton: { backgroundColor: '#000' },
  defaultText: { color: '#fff' },

  destructiveButton: { backgroundColor: '#ff3b30' },
  destructiveText: { color: '#fff' },
});

export default CustomAlertDialog;