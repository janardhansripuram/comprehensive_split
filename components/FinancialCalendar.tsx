import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getFinancialCalendarEvents } from '@/services/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  DollarSign,
  Bell,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native';

interface CalendarEvent {
  id: string;
  type: 'reminder' | 'recurring_expense';
  title: string;
  date: Date;
  amount?: number;
  currency?: string;
  category?: string;
}

interface FinancialCalendarProps {
  visible: boolean;
  onClose: () => void;
}

export default function FinancialCalendar({ visible, onClose }: FinancialCalendarProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && user) {
      loadCalendarEvents();
    }
  }, [visible, user, currentMonth]);

  const loadCalendarEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get first and last day of current month
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const calendarEvents = await getFinancialCalendarEvents(user.uid, firstDay, lastDay);
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.calendarDay} />
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const isToday = new Date().toISOString().split('T')[0] === dateString;
      const isSelected = selectedDate && selectedDate.toISOString().split('T')[0] === dateString;
      
      // Check if there are events on this day
      const dayEvents = events.filter(event => 
        event.date.toISOString().split('T')[0] === dateString
      );
      
      const hasEvents = dayEvents.length > 0;
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isToday && styles.today,
            isSelected && styles.selectedDay,
          ]}
          onPress={() => setSelectedDate(date)}
        >
          <Text style={[
            styles.calendarDayText,
            isToday && styles.todayText,
            isSelected && styles.selectedDayText,
          ]}>
            {day}
          </Text>
          {hasEvents && (
            <View style={[
              styles.eventIndicator,
              isSelected && styles.selectedEventIndicator
            ]} />
          )}
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    
    const dateString = selectedDate.toISOString().split('T')[0];
    return events.filter(event => 
      event.date.toISOString().split('T')[0] === dateString
    );
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long' });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    monthYearText: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    monthNavButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    weekdaysRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    weekday: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
    },
    weekdayText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: colors.textSecondary,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 8,
    },
    calendarDay: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    calendarDayText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.text,
    },
    today: {
      backgroundColor: colors.primary + '20',
      borderRadius: 8,
    },
    todayText: {
      fontFamily: 'Inter-SemiBold',
      color: colors.primary,
    },
    selectedDay: {
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    selectedDayText: {
      color: '#FFFFFF',
      fontFamily: 'Inter-SemiBold',
    },
    eventIndicator: {
      position: 'absolute',
      bottom: 6,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    selectedEventIndicator: {
      backgroundColor: '#FFFFFF',
    },
    eventsContainer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    eventsTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 16,
    },
    eventCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    eventIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    eventInfo: {
      flex: 1,
    },
    eventTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 4,
    },
    eventType: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    eventAmount: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      color: colors.error,
    },
    noEventsText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      padding: 20,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Financial Calendar</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarHeader}>
            <TouchableOpacity style={styles.monthNavButton} onPress={goToPreviousMonth}>
              <ChevronLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.monthYearText}>
              {getMonthName(currentMonth)} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity style={styles.monthNavButton} onPress={goToNextMonth}>
              <ChevronRight size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdaysRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <View key={index} style={styles.weekday}>
                <Text style={styles.weekdayText}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {renderCalendar()}
          </View>

          <View style={styles.eventsContainer}>
            <Text style={styles.eventsTitle}>
              {selectedDate ? `Events on ${selectedDate.toLocaleDateString()}` : 'Select a date to view events'}
            </Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedDate ? (
                getSelectedDateEvents().length > 0 ? (
                  getSelectedDateEvents().map((event) => (
                    <View key={event.id} style={styles.eventCard}>
                      <View style={styles.eventIconContainer}>
                        {event.type === 'reminder' ? (
                          <Bell size={20} color={colors.warning} />
                        ) : (
                          <DollarSign size={20} color={colors.error} />
                        )}
                      </View>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <Text style={styles.eventType}>
                          {event.type === 'reminder' ? 'Reminder' : 'Recurring Expense'}
                        </Text>
                        {event.amount && (
                          <Text style={styles.eventAmount}>
                            -{event.currency || '$'}{event.amount.toFixed(2)}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noEventsText}>No events on this date</Text>
                )
              ) : (
                <Text style={styles.noEventsText}>Select a date to view events</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}