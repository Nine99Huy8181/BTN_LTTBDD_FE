// components/FilterModal.tsx
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  maxRating: string;
  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;
  setMinRating: (value: string) => void;
  setMaxRating: (value: string) => void;
  onClear: () => void;
  onApply: () => void;
}

export default function FilterModal({
  visible,
  onClose,
  minPrice,
  maxPrice,
  minRating,
  maxRating,
  setMinPrice,
  setMaxPrice,
  setMinRating,
  setMaxRating,
  onClear,
  onApply,
}: FilterModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Products</Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Price Range</Text>
            <View style={styles.filterRow}>
              <View style={styles.filterInputWrapper}>
                <Text style={styles.inputPrefix}>$</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Min"
                  placeholderTextColor="#9CA3AF"
                  value={minPrice}
                  onChangeText={setMinPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.filterDivider} />
              <View style={styles.filterInputWrapper}>
                <Text style={styles.inputPrefix}>$</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Max"
                  placeholderTextColor="#9CA3AF"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Rating</Text>
            <View style={styles.filterRow}>
              <View style={styles.filterInputWrapper}>
                <Ionicons name="star" size={16} color="#FCD34D" style={styles.ratingIcon} />
                <TextInput
                  style={styles.filterInput}
                  placeholder="Min (0-5)"
                  placeholderTextColor="#9CA3AF"
                  value={minRating}
                  onChangeText={setMinRating}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.filterDivider} />
              <View style={styles.filterInputWrapper}>
                <Ionicons name="star" size={16} color="#FCD34D" style={styles.ratingIcon} />
                <TextInput
                  style={styles.filterInput}
                  placeholder="Max (0-5)"
                  placeholderTextColor="#9CA3AF"
                  value={maxRating}
                  onChangeText={setMaxRating}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={onClear}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={onApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  inputPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  ratingIcon: {
    marginRight: 8,
  },
  filterInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  filterDivider: {
    width: 20,
    height: 2,
    backgroundColor: '#E5E7EB',
    borderRadius: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 50,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});