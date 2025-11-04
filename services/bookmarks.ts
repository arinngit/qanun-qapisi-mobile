import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = 'test_bookmarks';

export const bookmarksService = {
  // Get all bookmarked test IDs
  getBookmarks: async (): Promise<string[]> => {
    try {
      const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
      return bookmarksJson ? JSON.parse(bookmarksJson) : [];
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return [];
    }
  },

  // Add a test to bookmarks
  addBookmark: async (testId: string): Promise<void> => {
    try {
      const bookmarks = await bookmarksService.getBookmarks();
      if (!bookmarks.includes(testId)) {
        const updatedBookmarks = [...bookmarks, testId];
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  },

  // Remove a test from bookmarks
  removeBookmark: async (testId: string): Promise<void> => {
    try {
      const bookmarks = await bookmarksService.getBookmarks();
      const updatedBookmarks = bookmarks.filter((id) => id !== testId);
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  },

  // Toggle bookmark status
  toggleBookmark: async (testId: string): Promise<boolean> => {
    try {
      const bookmarks = await bookmarksService.getBookmarks();
      const isBookmarked = bookmarks.includes(testId);

      if (isBookmarked) {
        await bookmarksService.removeBookmark(testId);
        return false;
      } else {
        await bookmarksService.addBookmark(testId);
        return true;
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  },

  // Check if a test is bookmarked
  isBookmarked: async (testId: string): Promise<boolean> => {
    try {
      const bookmarks = await bookmarksService.getBookmarks();
      return bookmarks.includes(testId);
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return false;
    }
  },

  // Clear all bookmarks
  clearAllBookmarks: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(BOOKMARKS_KEY);
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
      throw error;
    }
  },
};

