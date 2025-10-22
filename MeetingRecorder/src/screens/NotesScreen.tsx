import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  useTheme,
  ActivityIndicator,
  Searchbar,
  Chip,
  Button,
  Menu,
  IconButton,
  Divider,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';

import { RootStackParamList, Meeting, NotesFilter } from '../types';
import { RootState } from '../store';
import { loadMeetings, setFilter, clearFilter, deleteMeeting } from '../store/meetingsSlice';

type NotesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Notes'>;

const NotesScreen: React.FC = () => {
  const navigation = useNavigation<NotesScreenNavigationProp>();
  const theme = useTheme();
  const dispatch = useDispatch();

  const { filteredMeetings, isLoading, activeFilter } = useSelector(
    (state: RootState) => state.meetings
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    dispatch(loadMeetings());
  }, [dispatch]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, sortBy, sortOrder]);

  const applyFilters = () => {
    const filter: NotesFilter = {
      ...activeFilter,
      searchText: searchQuery.trim() || undefined,
    };
    dispatch(setFilter(filter));
  };

  const handleDateFilter = () => {
    Alert.alert(
      'Date Filter',
      'Select date range',
      [
        { text: 'Today', onPress: () => setDateFilter('today') },
        { text: 'This Week', onPress: () => setDateFilter('week') },
        { text: 'This Month', onPress: () => setDateFilter('month') },
        { text: 'Clear', onPress: () => clearDateFilter() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const setDateFilter = (period: 'today' | 'week' | 'month') => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const filter: NotesFilter = {
      ...activeFilter,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
    dispatch(setFilter(filter));
  };

  const clearDateFilter = () => {
    const filter: NotesFilter = {
      ...activeFilter,
      startDate: undefined,
      endDate: undefined,
    };
    dispatch(setFilter(filter));
  };

  const handleLocationFilter = () => {
    // Get unique locations from meetings
    const locations = Array.from(
      new Set(
        filteredMeetings
          .map(m => m.location?.city || m.location?.address)
          .filter(Boolean)
      )
    );

    if (locations.length === 0) {
      Alert.alert('No Locations', 'No meetings with location data found.');
      return;
    }

    const buttons = locations.map(location => ({
      text: location,
      onPress: () => setLocationFilter(location!),
    }));

    buttons.push(
      { text: 'Clear', onPress: () => clearLocationFilter() },
      { text: 'Cancel', style: 'cancel' as const }
    );

    Alert.alert('Filter by Location', 'Select a location', buttons);
  };

  const setLocationFilter = (location: string) => {
    const filter: NotesFilter = {
      ...activeFilter,
      location,
    };
    dispatch(setFilter(filter));
  };

  const clearLocationFilter = () => {
    const filter: NotesFilter = {
      ...activeFilter,
      location: undefined,
    };
    dispatch(setFilter(filter));
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    dispatch(clearFilter());
  };

  const handleDeleteMeeting = (meeting: Meeting) => {
    Alert.alert(
      'Delete Meeting',
      `Are you sure you want to delete "${meeting.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteMeeting(meeting.id)),
        },
      ]
    );
  };

  const sortedMeetings = React.useMemo(() => {
    const sorted = [...filteredMeetings].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredMeetings, sortBy, sortOrder]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (durationMs: number) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const hasActiveFilters = () => {
    return searchQuery.length > 0 || 
           activeFilter.startDate || 
           activeFilter.location;
  };

  const renderMeetingCard = ({ item: meeting }: { item: Meeting }) => (
    <Card
      style={[styles.meetingCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate('NoteDetail', { meetingId: meeting.id })}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.meetingInfo}>
            <Text style={[styles.meetingTitle, { color: theme.colors.onSurface }]}>
              {meeting.title}
            </Text>
            <Text style={[styles.meetingDate, { color: theme.colors.onSurfaceVariant }]}>
              {formatDate(meeting.date)} • {formatDuration(meeting.duration)}
            </Text>
          </View>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDeleteMeeting(meeting)}
            iconColor={theme.colors.error}
          />
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.chips}>
            {meeting.transcription && (
              <Chip compact mode="outlined" style={styles.chip}>
                Transcribed
              </Chip>
            )}
            {meeting.translation && (
              <Chip compact mode="outlined" style={styles.chip}>
                Translated
              </Chip>
            )}
            {meeting.isUploaded && (
              <Chip compact mode="outlined" style={styles.chip}>
                Synced
              </Chip>
            )}
          </View>

          {meeting.location && (
            <View style={styles.locationInfo}>
              <MaterialIcons
                name="location-on"
                size={14}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={[styles.locationText, { color: theme.colors.onSurfaceVariant }]}>
                {meeting.location.city || meeting.location.address || 'Unknown'}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons
        name="search-off"
        size={64}
        color={theme.colors.onSurfaceVariant}
      />
      <Title style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        {hasActiveFilters() ? 'No matching meetings' : 'No meetings found'}
      </Title>
      <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
        {hasActiveFilters()
          ? 'Try adjusting your search or filters'
          : 'Start recording meetings to see them here'}
      </Text>
      {hasActiveFilters() && (
        <Button mode="outlined" onPress={clearAllFilters} style={styles.clearButton}>
          Clear Filters
        </Button>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search meetings..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />
        
        <View style={styles.filterRow}>
          <View style={styles.filterChips}>
            {activeFilter.startDate && (
              <Chip
                mode="flat"
                onPress={clearDateFilter}
                onClose={clearDateFilter}
                style={styles.activeFilter}
              >
                Date Filter
              </Chip>
            )}
            {activeFilter.location && (
              <Chip
                mode="flat"
                onPress={clearLocationFilter}
                onClose={clearLocationFilter}
                style={styles.activeFilter}
              >
                {activeFilter.location}
              </Chip>
            )}
          </View>

          <View style={styles.filterActions}>
            <IconButton
              icon="calendar"
              size={24}
              onPress={handleDateFilter}
              mode={activeFilter.startDate ? 'contained-tonal' : 'standard'}
            />
            <IconButton
              icon="map-marker"
              size={24}
              onPress={handleLocationFilter}
              mode={activeFilter.location ? 'contained-tonal' : 'standard'}
            />
            <Menu
              visible={sortMenuVisible}
              onDismiss={() => setSortMenuVisible(false)}
              anchor={
                <IconButton
                  icon="sort"
                  size={24}
                  onPress={() => setSortMenuVisible(true)}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  setSortBy('date');
                  setSortMenuVisible(false);
                }}
                title="Sort by Date"
                leadingIcon="calendar"
              />
              <Menu.Item
                onPress={() => {
                  setSortBy('title');
                  setSortMenuVisible(false);
                }}
                title="Sort by Title"
                leadingIcon="sort-alphabetical-ascending"
              />
              <Menu.Item
                onPress={() => {
                  setSortBy('duration');
                  setSortMenuVisible(false);
                }}
                title="Sort by Duration"
                leadingIcon="timer"
              />
              <Divider />
              <Menu.Item
                onPress={() => {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  setSortMenuVisible(false);
                }}
                title={sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                leadingIcon={sortOrder === 'asc' ? 'sort-descending' : 'sort-ascending'}
              />
            </Menu>
          </View>
        </View>
      </View>

      {/* Meetings List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            Loading meetings...
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedMeetings}
          renderItem={renderMeetingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    marginBottom: 12,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterChips: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  activeFilter: {
    backgroundColor: '#E3F2FD',
  },
  filterActions: {
    flexDirection: 'row',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  meetingCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardContent: {
    paddingVertical: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  meetingDate: {
    fontSize: 14,
  },
  cardMeta: {
    gap: 8,
  },
  chips: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    height: 24,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  clearButton: {
    marginTop: 8,
  },
});

export default NotesScreen;