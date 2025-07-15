import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { Download, FileText, Database, X } from 'lucide-react-native';

interface DataExportProps {
  visible: boolean;
  onClose: () => void;
}

export default function DataExport({ visible, onClose }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    {
      id: 'csv',
      name: 'CSV File',
      description: 'Spreadsheet compatible format',
      icon: FileText,
      color: '#10B981'
    },
    {
      id: 'json',
      name: 'JSON File',
      description: 'Raw data format',
      icon: Database,
      color: '#3B82F6'
    },
    {
      id: 'pdf',
      name: 'PDF Report',
      description: 'Formatted report document',
      icon: Download,
      color: '#EF4444'
    }
  ];

  const handleExport = async (format: string) => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Export Complete',
        `Your data has been exported as ${format.toUpperCase()} format.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'There was an error exporting your data.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Export Data</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Choose a format to export your expense data
        </Text>

        <View style={styles.formatList}>
          {exportFormats.map((format) => {
            const IconComponent = format.icon;
            return (
              <TouchableOpacity
                key={format.id}
                style={styles.formatItem}
                onPress={() => handleExport(format.id)}
                disabled={isExporting}
              >
                <View style={[styles.iconContainer, { backgroundColor: format.color + '20' }]}>
                  <IconComponent size={24} color={format.color} />
                </View>
                <View style={styles.formatInfo}>
                  <Text style={styles.formatName}>{format.name}</Text>
                  <Text style={styles.formatDescription}>{format.description}</Text>
                </View>
                <Download size={20} color="#666" />
              </TouchableOpacity>
            );
          })}
        </View>

        {isExporting && (
          <View style={styles.exportingContainer}>
            <Text style={styles.exportingText}>Exporting your data...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  formatList: {
    paddingHorizontal: 20,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  formatInfo: {
    flex: 1,
  },
  formatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  formatDescription: {
    fontSize: 14,
    color: '#666',
  },
  exportingContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  exportingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});